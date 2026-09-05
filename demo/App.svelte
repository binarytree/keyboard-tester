<script lang="ts">
  import KeyboardTester from "../components/KeyboardTester.svelte";
</script>

<div class="demo-wrap">
  <p class="hint">Use the Win / Mac / ChromeOS buttons in the toolbar to switch layouts.</p>
  <KeyboardTester />
</div>

<style>
  .demo-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }



  .hint {
    font-size: 0.85rem;
    color: var(--color-ink-muted, #5a5f73);
    margin: 0 0 12px;
  }
</style>
