import { describe, expect, it } from "vitest";
import { shouldPreventBrowserKey } from "./keyboardEvents";

function fakeKeyboardEvent(key: string, code: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key,
    code,
    altKey: options.altKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    target: null,
    ...options,
  } as unknown as KeyboardEvent;
}

describe("shouldPreventBrowserKey", () => {
  it("prevents Space, Arrow keys, Backspace, and Function keys", () => {
    expect(shouldPreventBrowserKey(fakeKeyboardEvent(" ", "Space"))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("ArrowUp", "ArrowUp"))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("Backspace", "Backspace"))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("F5", "F5"))).toBe(true);
  });

  it("prevents ChromeOS top-row action keys from navigating away", () => {
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("BrowserBack", "BrowserBack"))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("BrowserForward", "BrowserForward"))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("BrowserRefresh", "BrowserRefresh"))).toBe(true);
  });

  it("prevents common browser command shortcuts like Cmd+R, Ctrl+W", () => {
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("r", "KeyR", { ctrlKey: true }))).toBe(true);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("w", "KeyW", { metaKey: true }))).toBe(true);
  });

  it("does not prevent normal letter keys", () => {
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("a", "KeyA"))).toBe(false);
    expect(shouldPreventBrowserKey(fakeKeyboardEvent("Enter", "Enter"))).toBe(false);
  });
});
