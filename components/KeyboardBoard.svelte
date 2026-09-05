<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    boardColumnStyle,
    boardHasMid,
    boardHasNumpad,
    type BoardRow,
    type KeyDef,
    type RowItem,
  } from "../src/index";

  type Props = {
    boardRows: BoardRow[];
    /** Extra classes for a keycap, e.g. "down tested held peak" */
    keyClass: (code: string) => string;
    /**
     * When true, never scale below MIN_COMFORT; enable horizontal scroll instead.
     * Used by ghosting on small viewports / full layouts.
     */
    comfortScroll?: boolean;
    /** Click a keycap (main tester uses this to flag "didn't register"). */
    onKeyClick?: (code: string) => void;
  };

  let { boardRows, keyClass, comfortScroll = false, onKeyClick }: Props = $props();

  const MIN_COMFORT = 0.55;

  let scale = $state(1);
  let boardHeight = $state(280);
  let scrollMode = $state(false);
  let shellEl: HTMLDivElement | undefined = $state();
  let boardEl: HTMLDivElement | undefined = $state();
  let boardInnerEl: HTMLDivElement | undefined = $state();

  const showMid = $derived(boardHasMid(boardRows));
  const showNum = $derived(boardHasNumpad(boardRows));
  const colStyle = $derived(boardColumnStyle(boardRows));

  function keyWidthStyle(k: KeyDef): string {
    return `calc(${k.w ?? 1} * var(--key-unit))`;
  }

  function gapWidthStyle(w: number): string {
    return `calc(${w} * var(--key-unit))`;
  }

  async function updateScale() {
    await tick();
    if (!boardInnerEl) return;

    boardInnerEl.style.transform = "scale(1)";
    const need = boardInnerEl.scrollWidth;
    const naturalH = boardInnerEl.offsetHeight;
    const host = boardEl ?? shellEl;
    const hostW = host?.clientWidth ?? 0;
    const avail = Math.max(0, hostW - (boardEl ? 24 : 8));

    let next = 1;
    if (need > 0 && avail > 0) {
      next = Math.min(1, (avail * 0.992) / need);
    }

    if (comfortScroll && next < MIN_COMFORT) {
      scrollMode = true;
      scale = MIN_COMFORT;
      boardHeight = Math.ceil(naturalH * MIN_COMFORT) + 8;
    } else {
      scrollMode = false;
      scale = Math.max(0.38, Math.floor(next * 1000) / 1000);
      boardHeight = Math.ceil(naturalH * scale) + 2;
    }
    boardInnerEl.style.transform = `scale(${scale})`;
  }

  onMount(() => {
    const ro = new ResizeObserver(() => void updateScale());
    if (shellEl) ro.observe(shellEl);
    void updateScale();
    return () => ro.disconnect();
  });

  $effect(() => {
    void boardRows;
    void updateScale();
  });
</script>

<div class="kb-shell" bind:this={shellEl}>
  {#if scrollMode}
    <p class="scroll-tip">Swipe sideways for the full keyboard.</p>
  {/if}

  <div
    class="board"
    class:scroll={scrollMode}
    bind:this={boardEl}
    style:height="{boardHeight + 26}px"
  >
    <div
      class="board-inner"
      class:has-mid={showMid}
      class:has-num={showNum}
      bind:this={boardInnerEl}
      style:transform="scale({scale})"
      style={colStyle}
    >
      <div class="rows-wrap">
        {#each boardRows as row, ri}
          <div class="row" data-row={ri}>
            <div class="cluster main">
              {#each row.main as item}
                {@render cell(item)}
              {/each}
            </div>
            {#if showMid}
              <div class="cluster mid">
                {#each row.mid as item}
                  {@render cell(item)}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
      {#if showNum}
        <div class="num-col">
          {#each boardRows as row}
            {#each row.numpad as item}
              {@render cell(item)}
            {/each}
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

{#snippet cell(item: RowItem)}
  {#if item.kind === "gap"}
    <div class="gap" style:width={gapWidthStyle(item.w)} aria-hidden="true"></div>
  {:else}
    <div
      class="key {item.region} {item.code} {keyClass(item.code)}"
      class:has-sub={!!item.label2}
      class:span2={item.spanY === 2}
      class:clickable={!!onKeyClick}
      style:width={keyWidthStyle(item)}
      style:grid-row={item.spanY === 2 ? "span 2" : undefined}
      style:grid-column={(item.w ?? 1) >= 2 ? `span ${item.w}` : undefined}
      title={item.code}
      onclick={onKeyClick ? () => onKeyClick(item.code) : undefined}
    >
      <span class="label">{item.label}</span>
      {#if item.label2}
        <span class="sub">{item.label2}</span>
      {/if}
    </div>
  {/if}
{/snippet}

<style>
  .kb-shell {
    --key-unit: 42px;
    --key-h: 40px;
    --key-gap: 5px;
    min-width: 0;
    max-width: 100%;
  }

  .scroll-tip {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-brand);
  }

  .board {
    overflow: hidden;
    padding: 12px 10px;
    border-radius: 14px;
    background: var(--color-surface-soft);
    border: 1px solid var(--color-border);
  }

  .board.scroll {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .board-inner {
    width: max-content;
    /* Center non-full layouts in the card; margin:auto collapses to 0
       when the keyboard is wider than the card (scroll mode), so the
       left edge stays reachable. */
    margin: 0 auto;
    transform-origin: top left;
    will-change: transform;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: calc(0.5 * var(--key-unit));
    align-items: start;
    --main-w: 0px;
    --mid-w: 0px;
    --num-w: 0px;
  }

  .rows-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--key-gap);
  }

  .row {
    display: grid;
    align-items: start;
    column-gap: calc(0.5 * var(--key-unit));
    grid-template-columns: var(--main-w);
  }

  .board-inner.has-mid .row {
    grid-template-columns: var(--main-w) var(--mid-w);
  }

  /* Numpad: its own 4x5 grid column, spanning the letter rows so tall
     keys (+ and Enter) can occupy two rows like a real numpad. The
     main area has an extra F-row on top; offset to align with letters. */
  .num-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, var(--key-h));
    gap: var(--key-gap);
    margin-top: calc(var(--key-h) + var(--key-gap));
  }

  .num-col .key.span2 {
    height: auto;
  }

  .cluster {
    display: flex;
    gap: var(--key-gap);
    min-height: var(--key-h);
  }

  .cluster.main {
    width: var(--main-w);
  }

  .cluster.mid {
    width: var(--mid-w);
  }

  .gap {
    flex-shrink: 0;
    height: var(--key-h);
  }

  .key {
    height: var(--key-h);
    min-width: var(--key-unit);
    flex-shrink: 0;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-key);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-ink);
    font-size: 11.5px;
    font-weight: 600;
    user-select: none;
    transition:
      background 0.08s ease,
      color 0.08s ease,
      border-color 0.08s ease,
      transform 0.06s cubic-bezier(0.2, 0, 0.2, 1),
      box-shadow 0.08s ease;
    /* 3D Keycap bevel: bottom shelf thickness + soft ambient shadow */
    box-shadow:
      inset 0 -3px 0 rgba(28, 39, 76, 0.12),
      0 2px 4px rgba(28, 39, 76, 0.04);
  }

  .key:hover {
    border-color: rgba(37, 99, 235, 0.35);
  }

  .key .label {
    pointer-events: none;
    padding: 0 2px;
    text-align: center;
    line-height: 1.05;
    font-weight: 600;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
  }

  .key.fn .label,
  .key.nav .label,
  .key.mods .label {
    font-size: 10px;
  }

  .key.sys .label {
    font-size: 9px;
  }

  .key .sub {
    pointer-events: none;
    font-size: 9px;
    line-height: 1;
    color: var(--color-ink-subtle);
    font-weight: 500;
    opacity: 0.8;
  }

  .key.has-sub {
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  /* Function / navigation / modifier keys read as a distinct tier —
     deeper grey than the alphanumerics so the split is visible at a
     glance (surface-soft was too close to white). */
  .key.fn,
  .key.nav,
  .key.mods,
  .key.sys {
    background: #edf0f8;
    color: var(--color-ink-subtle);
    border-color: var(--color-border);
    box-shadow:
      inset 0 -3px 0 rgba(28, 39, 76, 0.15),
      0 2px 4px rgba(28, 39, 76, 0.04);
  }

  /* Side keys align their legends like a real keyboard */
  .key.Tab,
  .key.CapsLock,
  .key.ShiftLeft,
  .key.ControlLeft,
  .key.Backquote {
    justify-content: flex-start;
    padding-left: 7px;
  }

  .key.Backspace,
  .key.Enter,
  .key.ShiftRight,
  .key.ControlRight {
    justify-content: flex-end;
    padding-right: 7px;
  }

  /* Dead-key test states: 3D travel downward & bottom-out glow */
  .key:global(.down) {
    background: linear-gradient(
      135deg,
      var(--color-brand) 0%,
      var(--color-brand-mid) 100%
    );
    border-color: rgba(37, 99, 235, 0.8);
    color: #fff;
    transform: translateY(2.5px);
    box-shadow:
      inset 0 1px 3px rgba(0, 0, 0, 0.25),
      0 0 14px rgba(37, 99, 235, 0.45);
  }

  .key:global(.tested) {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #065f46;
    box-shadow:
      inset 0 -2.5px 0 #6ee7b7,
      0 1px 3px rgba(16, 185, 129, 0.08);
  }

  .key:global(.stuck) {
    background: #fffbeb;
    border-color: #fde68a;
    color: #92400e;
    box-shadow:
      inset 0 -2.5px 0 #fcd34d,
      0 0 10px rgba(245, 158, 11, 0.35);
  }

  .key:global(.missed) {
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;
    box-shadow:
      inset 0 -2.5px 0 #fca5a5,
      0 0 8px rgba(239, 68, 68, 0.25);
  }

  .key.clickable:global(.untested),
  .key.clickable:global(.missed) {
    cursor: pointer;
  }

  /* Ghosting states */
  .key:global(.held) {
    background: linear-gradient(
      135deg,
      var(--color-brand) 0%,
      var(--color-brand-mid) 100%
    );
    border-color: rgba(37, 99, 235, 0.8);
    color: #fff;
    transform: translateY(2.5px);
    box-shadow:
      inset 0 1px 3px rgba(0, 0, 0, 0.25),
      0 0 14px rgba(37, 99, 235, 0.45);
  }

  .key:global(.peak):not(:global(.held)) {
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.28);
    border-color: rgba(37, 99, 235, 0.35);
    background: #eef0ff;
  }

  @media (max-width: 900px) {
    .kb-shell {
      --key-unit: 38px;
      --key-h: 36px;
      --key-gap: 4px;
    }

    .key {
      font-size: 10px;
    }
  }

  @media (max-width: 600px) {
    .kb-shell {
      --key-unit: 36px;
      --key-h: 34px;
    }
  }
</style>
