/**
 * Shared keyboard event policy for browser-based testers.
 * Keeps multi-key tools from triggering browser chrome (scroll, reload, etc.)
 * without breaking keyboard accessibility.
 */
export function shouldPreventBrowserKey(e: KeyboardEvent): boolean {
  const t = e.target;
  const onInteractive =
    typeof HTMLElement !== "undefined" &&
    t instanceof HTMLElement &&
    t.closest(
      "a, button, input, select, textarea, summary, [role='button'], [tabindex], [contenteditable]",
    ) !== null;

  // Keyboard navigation must keep working: never swallow Tab on the page
  // chrome (body) or on interactive elements. Only intercept it when focus
  // sits on a non-interactive element inside the tester.
  if (e.key === "Tab") {
    const onBody =
      !t ||
      (typeof document !== "undefined" &&
        (t === document.body || t === document.documentElement));
    return !onBody && !onInteractive;
  }

  // Interactive elements keep their default behavior (Space activates
  // buttons, arrows toggle <details>), while the page body stays
  // scroll-proof so test keys are captured cleanly.
  if (onInteractive) return false;

  if (
    e.key === " " ||
    e.code === "Space" ||
    e.key.startsWith("Arrow") ||
    e.code.startsWith("Arrow") ||
    e.key === "Backspace" ||
    e.code === "Backspace"
  ) {
    return true;
  }
  if (/^F\d{1,2}$/.test(e.code)) return true;
  if (
    e.key.startsWith("Browser") ||
    e.code.startsWith("Browser") ||
    ["BrowserBack", "BrowserForward", "BrowserRefresh", "BrowserHome", "BrowserFavorites", "BrowserSearch"].includes(e.key)
  ) {
    return true;
  }
  if (e.altKey) return true;
  if (
    (e.ctrlKey || e.metaKey) &&
    ["KeyR", "KeyS", "KeyP", "KeyF", "KeyW"].includes(e.code)
  ) {
    return true;
  }
  return false;
}
