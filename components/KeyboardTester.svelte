<script lang="ts">
  import { onMount } from "svelte";
  import {
    getBoardRows,
    flattenKeys,
    detectOsLayout,
    normalizeChromeosCode,
    shouldPreventBrowserKey,
    emptyKeyState,
    keyStateReducer,
    STUCK_HOLD_MS,
    formatNames,
    formatReport,
    partitionKeys,
    type OsLayout,
    type SizeLayout,
    type FormLayout,
    type ReportStrings,
  } from "../src/index";
  import KeyboardBoard from "./KeyboardBoard.svelte";

  interface Translations {
    ariaLabel: string;
    reset: string;
    held: string;
    autoMac: string;
    autoWin: string;
    autoChromeos: string;
    progressAria: string;
    holding: string;
    listening: string;
    allDone: string;
    remaining: string;
    untested: string;
    pressed: string;
    tested: string;
    stuck: string;
    missed: string;
    lastKeyNone: string;
    copySummary: string;
    copied: string;
    copyFailed: string;
    summary: string;
    stuckList: string;
    missedList: string;
    flagHint: string;
    reportHeading: string;
    reportMeta: string;
    reportStuck: string;
    reportMissed: string;
    reportUntested: string;
    reportLegend: string;
    reportMissedNote: string;
    reportFnNote: string;
  }

  const defaultT: Translations = {
    ariaLabel: "Keyboard tester. Press keys on your keyboard to test them.",
    reset: "Reset",
    held: "Held",
    autoMac: "Auto: Mac",
    autoWin: "Auto: Win",
    autoChromeos: "Auto: ChromeOS",
    progressAria: "Keys checked",
    holding: "Holding {n} key{s}. Release to mark tested.",
    listening: "Press any key. Listening now.",
    allDone: "All visible keys checked. Hit Reset to start over.",
    remaining: "{n} key{s} left.",
    untested: "Untested",
    pressed: "Pressed",
    tested: "Tested",
    stuck: "Stuck",
    missed: "Didn't register",
    lastKeyNone: "Last key: none",
    copySummary: "Copy summary",
    copied: "Copied",
    copyFailed: "Couldn't copy",
    summary: "{checked} checked · {stuck} stuck · {missed} didn't register",
    stuckList: "Stuck:",
    missedList: "Didn't register:",
    flagHint: "Click a gray key if you pressed it and it didn't light.",
    reportHeading: "Keyboard test",
    reportMeta: "{date} · {os} · {size} · {checked}/{total} keys checked",
    reportStuck: "Stuck ({n}): {names}",
    reportMissed: "Didn't register ({n}): {names}",
    reportUntested: "Not pressed ({n}): {names}",
    reportLegend: "Green = released OK. Amber = press with no release.",
    reportMissedNote:
      '"Didn\'t register" = pressed on the real board, no event in the browser.',
    reportFnNote: "Fn and media keys often never reach the browser.",
  };

  function fill(tpl: string, n: number): string {
    return tpl.replaceAll("{n}", String(n)).replaceAll("{s}", n === 1 ? "" : "s");
  }

  let { initialOs, initialSize = "tkl", initialForm = "ansi", t = {} }: {
    initialOs?: OsLayout;
    initialSize?: SizeLayout;
    initialForm?: FormLayout;
    t?: Partial<Translations>;
  } = $props();
  const T = {
    ...defaultT,
    ...Object.fromEntries(Object.entries(t).filter(([, v]) => v != null)),
  };

  let os = $state<OsLayout>(initialOs ?? "win");
  let size = $state<SizeLayout>(initialSize);
  let form = $state<FormLayout>(initialForm);
  let osDetected = $state(false);
  let keyState = $state(emptyKeyState());
  let locks = $state({ caps: false, num: false, scroll: false });
  const { states, held, last } = $derived(keyState);

  const boardRows = $derived(getBoardRows(os, size, form));
  const allKeys = $derived(flattenKeys(boardRows));
  const total = $derived(allKeys.length);
  const reportKeys = $derived(allKeys.map((k) => ({ code: k.code, label: k.label })));
  const part = $derived(partitionKeys(reportKeys, states, held));
  const checkedCount = $derived(part.tested.length + part.stuck.length + part.missed.length);
  const progress = $derived(total ? Math.round((checkedCount / total) * 100) : 0);
  const heldCount = $derived(held.size);
  const remaining = $derived(Math.max(0, total - checkedCount));
  const showReport = $derived(checkedCount > 0);
  const summaryText = $derived(
    T.summary
      .replaceAll("{checked}", String(checkedCount))
      .replaceAll("{stuck}", String(part.stuck.length))
      .replaceAll("{missed}", String(part.missed.length)),
  );
  const reportCopy = $derived<ReportStrings>({
    heading: T.reportHeading,
    metaLine: (date, osLabel, sizeLabel, checked, tot) =>
      T.reportMeta
        .replaceAll("{date}", date)
        .replaceAll("{os}", osLabel)
        .replaceAll("{size}", sizeLabel)
        .replaceAll("{checked}", String(checked))
        .replaceAll("{total}", String(tot)),
    stuckLine: (n, names) =>
      T.reportStuck.replaceAll("{n}", String(n)).replaceAll("{names}", names),
    missedLine: (n, names) =>
      T.reportMissed.replaceAll("{n}", String(n)).replaceAll("{names}", names),
    untestedLine: (n, names) =>
      T.reportUntested.replaceAll("{n}", String(n)).replaceAll("{names}", names),
    legend: T.reportLegend,
    missedNote: T.reportMissedNote,
    fnNote: T.reportFnNote,
  });

  let copyStatus = $state<"idle" | "copied" | "failed">("idle");
  let copyTimer = 0;

  function stateOf(code: string): string {
    if (held.has(code)) return "down";
    return states[code] ?? "untested";
  }

  function keyClass(code: string): string {
    return stateOf(code);
  }

  function onKeyClick(code: string) {
    keyState = keyStateReducer(keyState, { type: "toggleMissed", code });
  }

  function reportMeta() {
    const sizeLabel = sizes.find((s) => s.id === size)?.label ?? size;
    const osLabel =
      os === "mac" ? "Mac" : os === "chromeos" ? "ChromeOS" : "Windows";
    return {
      date: new Date().toISOString().slice(0, 10),
      osLabel,
      sizeLabel,
      url: typeof location !== "undefined" ? location.href : "",
    };
  }

  async function copySummary() {
    const text = formatReport(part, reportMeta(), reportCopy);
    try {
      await navigator.clipboard.writeText(text);
      copyStatus = "copied";
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        copyStatus = "copied";
      } catch {
        copyStatus = "failed";
      }
    }
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyStatus = "idle";
    }, 2000);
  }

  const holdTimers = new Map<string, number>();

  function clearHoldTimer(code: string) {
    const id = holdTimers.get(code);
    if (id !== undefined) {
      window.clearTimeout(id);
      holdTimers.delete(code);
    }
  }

  function clearAllHoldTimers() {
    for (const id of holdTimers.values()) window.clearTimeout(id);
    holdTimers.clear();
  }

  function armHoldTimer(code: string) {
    clearHoldTimer(code);
    holdTimers.set(
      code,
      window.setTimeout(() => {
        holdTimers.delete(code);
        keyState = keyStateReducer(keyState, { type: "holdTimeout", code });
      }, STUCK_HOLD_MS),
    );
  }

  function reset() {
    clearAllHoldTimers();
    window.clearTimeout(copyTimer);
    copyStatus = "idle";
    keyState = emptyKeyState();
  }

  function onOs(next: OsLayout) {
    if (os === next) return;
    os = next;
    reset();
  }

  function onSize(next: SizeLayout) {
    if (size === next) return;
    size = next;
    reset();
  }

  function onForm(next: FormLayout) {
    if (form === next) return;
    form = next;
    reset();
  }

  function syncLocks(e: KeyboardEvent) {
    try {
      locks = {
        caps: e.getModifierState("CapsLock"),
        num: e.getModifierState("NumLock"),
        scroll: e.getModifierState("ScrollLock"),
      };
    } catch {
      /* older Safari */
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (shouldPreventBrowserKey(e)) e.preventDefault();
    const raw = e.code;
    if (!raw || raw === "Unidentified") return;
    const code = os === "chromeos" ? normalizeChromeosCode(raw) : raw;

    syncLocks(e);
    keyState = keyStateReducer(keyState, {
      type: "down",
      press: { code, key: e.key, location: e.location, repeat: e.repeat },
    });
    if (!e.repeat) armHoldTimer(code);
  }

  function onKeyUp(e: KeyboardEvent) {
    const raw = e.code;
    if (!raw || raw === "Unidentified") return;
    const code = os === "chromeos" ? normalizeChromeosCode(raw) : raw;

    syncLocks(e);
    clearHoldTimer(code);
    keyState = keyStateReducer(keyState, { type: "up", code });
  }

  function onWindowBlur() {
    clearAllHoldTimers();
    keyState = keyStateReducer(keyState, { type: "blur" });
  }

  onMount(() => {
    if (!initialOs) {
      os = detectOsLayout();
      osDetected = true;
    }

    const down = (e: KeyboardEvent) => onKeyDown(e);
    const up = (e: KeyboardEvent) => onKeyUp(e);
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", onWindowBlur);
      clearAllHoldTimers();
      window.clearTimeout(copyTimer);
    };
  });

  const sizes: { id: SizeLayout; label: string }[] = [
    { id: "60", label: "60%" },
    { id: "65", label: "65%" },
    { id: "75", label: "75%" },
    { id: "tkl", label: "TKL" },
    { id: "full", label: "Full" },
  ];
</script>

<div class="tester" role="application" aria-label={T.ariaLabel}>
  <div class="toolbar">
    <div class="seg" role="group" aria-label="OS layout">
      <button type="button" class:active={os === "win"} onclick={() => onOs("win")}
        >Win</button
      >
      <button type="button" class:active={os === "mac"} onclick={() => onOs("mac")}
        >Mac</button
      >
      <button type="button" class:active={os === "chromeos"} onclick={() => onOs("chromeos")}
        >ChromeOS</button
      >
    </div>
    <div class="seg" role="group" aria-label="Physical format">
      <button type="button" class:active={form === "ansi"} onclick={() => onForm("ansi")}
        >ANSI</button
      >
      <button type="button" class:active={form === "iso"} onclick={() => onForm("iso")}
        >ISO</button
      >
    </div>
    <div class="seg sizes" role="group" aria-label="Keyboard size">
      {#each sizes as s}
        <button type="button" class:active={size === s.id} onclick={() => onSize(s.id)}
          >{s.label}</button
        >
      {/each}
    </div>
    <button type="button" class="reset" onclick={reset}>{T.reset}</button>
  </div>

  <div class="meta">
    <div class="locks" title="Updates when you press Caps, Num, or Scroll Lock">
      <span class:on={locks.caps}>Caps</span>
      <span class:on={locks.num}>Num</span>
      <span class:on={locks.scroll}>Scr</span>
    </div>
    <div
      class="mini-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label={T.progressAria}
    >
      <div class="fill" style:width="{progress}%"></div>
    </div>
    <span class="prog-label">{checkedCount}/{total} · {progress}%</span>
    <span
      class="readout"
      title={last ? `code=${last.code} · key=${last.key}` : undefined}
      ><code>{last ? last.code : "—"}</code></span
    >
    <span class="held" class:hot={heldCount > 0}>{T.held} {heldCount}</span>
  </div>

  <p class="hint" role="status" aria-live="polite">
    {#if heldCount > 0}
      {fill(T.holding, heldCount)}
    {:else if checkedCount === 0}
      {T.listening}
    {:else if progress === 100}
      {T.allDone}
    {:else}
      <span class="visually-hidden">{fill(T.remaining, remaining)}</span>
    {/if}
  </p>

  <KeyboardBoard
    boardRows={boardRows}
    keyClass={keyClass}
    comfortScroll
    onKeyClick={onKeyClick}
  />

  <div class="status">
    <div class="legend">
      <span><i class="sw untested"></i> {T.untested}</span>
      <span><i class="sw down"></i> {T.pressed}</span>
      <span><i class="sw tested"></i> {T.tested}</span>
      <span><i class="sw stuck"></i> {T.stuck}</span>
      <span><i class="sw missed"></i> {T.missed}</span>
    </div>
    {#if showReport}
      <button type="button" class="copy-btn" onclick={copySummary}>
        {copyStatus === "copied" ? T.copied : copyStatus === "failed" ? T.copyFailed : T.copySummary}
      </button>
    {/if}
  </div>

  {#if showReport}
    <div class="report">
      <p class="report-summary">{summaryText}</p>
      {#if part.stuck.length}
        <p class="report-line"><strong>{T.stuckList}</strong> {formatNames(part.stuck)}</p>
      {/if}
      {#if part.missed.length}
        <p class="report-line"><strong>{T.missedList}</strong> {formatNames(part.missed)}</p>
      {/if}
      <p class="report-hint">{T.flagHint}</p>
    </div>
  {/if}
</div>

<style>
  .tester {
    outline: none;
    border-radius: calc(var(--radius-card, 16px) - 4px);
    background: var(--color-surface, #fff);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  .seg {
    display: inline-flex;
    padding: 3px;
    border-radius: var(--radius-pill, 999px);
    background: var(--color-surface-soft, #f1f2f7);
    border: 1px solid var(--color-border, #d7dae3);
  }

  .seg button {
    border: 0;
    background: transparent;
    color: var(--color-ink-muted, #5a5f73);
    font-size: 13px;
    font-weight: 600;
    padding: 6px 11px;
    border-radius: var(--radius-pill, 999px);
    cursor: pointer;
  }

  .seg button.active {
    background: var(--color-surface, #fff);
    color: var(--color-brand, #635bff);
    box-shadow: 0 1px 3px rgba(28, 39, 76, 0.08);
  }

  .reset {
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: var(--radius-pill, 999px);
    border: 1px solid var(--color-border, #d7dae3);
    background: transparent;
    color: var(--color-ink-muted, #5a5f73);
    cursor: pointer;
    margin-inline-start: auto;
  }

  .reset:hover {
    border-color: var(--color-brand, #635bff);
    color: var(--color-brand, #635bff);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    background: var(--color-surface-soft, #f1f2f7);
    border: 1px solid var(--color-border, #d7dae3);
    border-radius: 12px;
    padding: 7px 14px;
    margin-bottom: 10px;
  }

  .locks {
    display: inline-flex;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-ink-subtle, #8b90a3);
  }

  .locks span.on {
    color: var(--color-brand, #635bff);
  }

  .mini-progress {
    flex: 1;
    min-width: 60px;
    height: 4px;
    border-radius: 2px;
    background: var(--color-border, #d7dae3);
    overflow: hidden;
  }

  .mini-progress .fill {
    height: 100%;
    background: var(--color-brand, #635bff);
    transition: width 0.15s ease;
  }

  .prog-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-ink-muted, #5a5f73);
  }

  .readout code {
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--color-ink-muted, #5a5f73);
  }

  .held {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-ink-muted, #5a5f73);
  }

  .held.hot {
    color: var(--color-brand, #635bff);
  }

  .hint {
    margin: 0 0 10px;
    font-size: 0.92rem;
    color: var(--color-ink-muted, #5a5f73);
    min-height: 1.4em;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 0.85rem;
    color: var(--color-ink-muted, #5a5f73);
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .sw {
    width: 12px;
    height: 12px;
    border-radius: 4px;
    display: inline-block;
  }

  .sw.untested {
    background: var(--color-border, #d7dae3);
  }

  .sw.down {
    background: var(--color-brand, #635bff);
  }

  .sw.tested {
    background: var(--color-success-soft, #d9f5e1);
    border: 1px solid #86efac;
  }

  .sw.stuck {
    background: var(--color-stuck-soft, #fdf3d8);
    border: 1px solid #fcd34d;
  }

  .sw.missed {
    background: var(--color-surface, #fff);
    border: 1px dashed var(--color-ink-subtle, #8b90a3);
  }

  .copy-btn {
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-brand, #635bff);
    background: var(--color-brand-soft, #eeedff);
    border: 1px solid var(--color-brand-tint, #d6d3ff);
    border-radius: var(--radius-pill, 999px);
    padding: 7px 16px;
    cursor: pointer;
  }

  .report {
    margin-top: 10px;
    padding: 12px 14px;
    background: var(--color-surface-soft, #f1f2f7);
    border: 1px solid var(--color-border, #d7dae3);
    border-radius: 12px;
    font-size: 0.9rem;
  }

  .report-summary {
    margin: 0 0 6px;
    font-weight: 600;
    color: var(--color-ink, #1c274c);
  }

  .report-line {
    margin: 4px 0;
    color: var(--color-ink-muted, #5a5f73);
  }

  .report-hint {
    margin: 6px 0 0;
    font-size: 0.82rem;
    color: var(--color-ink-subtle, #8b90a3);
  }
</style>
