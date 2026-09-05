/**
 * ChromeOS keyboard layout — fully independent of the ANSI win/mac board.
 *
 * Chromebook keyboards differ structurally, not just by label:
 *   - Search/Launcher key replaces Caps Lock (physical position 1.75u).
 *     Its DOM code is MetaLeft — Chromebooks have no separate Win key, so
 *     the Search key and an external keyboard's Win key both match here.
 *   - Top row is ChromeOS action keys (Back/Forward/Refresh/...), not F1-F12.
 *     Physical presses emit DOM codes like BrowserBack (Chromium
 *     EventRewriterChromeOS), NOT F1..F10.
 *   - No PrintScreen/ScrollLock/Pause block, no numpad, no Menu key.
 *
 * Aliasing: when the user enables "Treat top-row keys as function keys"
 * (or on variants of the top-row mapping), the browser emits F1..F10
 * instead of the action codes. `normalizeChromeosCode` maps those back to
 * the action code so the same layout key lights up either way.
 */

import type { BoardRow, KeyDef, RowItem, SizeLayout } from "./layouts";
import { SIZE_REGIONS } from "./regions";

export type ChromeosCode =
  | "Escape"
  | "BrowserBack"
  | "BrowserForward"
  | "BrowserRefresh"
  | "ZoomToggle"
  | "SelectTask"
  | "BrightnessDown"
  | "BrightnessUp"
  | "VolumeMute"
  | "VolumeDown"
  | "VolumeUp";

/**
 * Map a physical top-row press to the action key it controls.
 *
 * Default (action-key) mode: the browser already reports the action code
 * (BrowserBack, BrightnessDown, ...) and this is a no-op.
 *
 * Function-key mode (Settings → Device → Keyboard → "Treat top-row keys
 * as function keys", or Search+top-row): the browser reports F1..F10.
 * The Chromium rewriter maps F1→Back, F2→Forward, F3→Refresh, F4→Zoom,
 * F5→SelectTask, F6→BrightnessDown, F7→BrightnessUp, F8→Mute,
 * F9→VolumeDown, F10→VolumeUp (legacy top-row layout).
 */
export function normalizeChromeosCode(code: string): string {
  switch (code) {
    case "F1":
      return "BrowserBack";
    case "F2":
      return "BrowserForward";
    case "F3":
      return "BrowserRefresh";
    case "F4":
      return "ZoomToggle";
    case "F5":
      return "SelectTask";
    case "F6":
      return "BrightnessDown";
    case "F7":
      return "BrightnessUp";
    case "F8":
      return "VolumeMute";
    case "F9":
      return "VolumeDown";
    case "F10":
      return "VolumeUp";
    default:
      return code;
  }
}

const key = (
  code: ChromeosCode | "Backquote" | "Digit1" | "Digit2" | "Digit3" | "Digit4" | "Digit5" | "Digit6" | "Digit7" | "Digit8" | "Digit9" | "Digit0" | "Minus" | "Equal" | "Backspace" | "Tab" | "KeyQ" | "KeyW" | "KeyE" | "KeyR" | "KeyT" | "KeyY" | "KeyU" | "KeyI" | "KeyO" | "KeyP" | "BracketLeft" | "BracketRight" | "Backslash" | "MetaLeft" | "KeyA" | "KeyS" | "KeyD" | "KeyF" | "KeyG" | "KeyH" | "KeyJ" | "KeyK" | "KeyL" | "Semicolon" | "Quote" | "Enter" | "ShiftLeft" | "KeyZ" | "KeyX" | "KeyC" | "KeyV" | "KeyB" | "KeyN" | "KeyM" | "Comma" | "Period" | "Slash" | "ShiftRight" | "ControlLeft" | "AltLeft" | "Space" | "AltRight" | "ControlRight" | "ArrowUp" | "ArrowLeft" | "ArrowDown" | "ArrowRight" | "Delete" | "Home" | "End" | "PageUp" | "PageDown" | "Insert",
  label: string,
  region: KeyDef["region"],
  w?: number,
  extra?: Partial<Pick<KeyDef, "label2" | "spanY">>,
): KeyDef => ({ code, label, region, w, ...extra });

const gap = (w: number): SpacerDef => ({ kind: "gap", w });

type SpacerDef = { kind: "gap"; w: number };

/**
 * ChromeOS full-size layout (no numpad — Chromebooks don't ship one).
 * Same three-cluster structure as ANSI_BOARD so column alignment holds.
 */
export const CHROMEOS_BOARD: BoardRow[] = [
  {
    // Top row: Esc + action keys. Chromebooks show icons here, not F1-F12.
    main: [
      key("Escape", "Esc", "fn"),
      key("BrowserBack", "←", "fn"),
      key("BrowserForward", "→", "fn"),
      key("BrowserRefresh", "⟳", "fn"),
      key("ZoomToggle", "⤢", "fn"),
      key("SelectTask", "▦", "fn"),
      gap(0.5),
      key("BrightnessDown", "☾", "fn"),
      key("BrightnessUp", "☀", "fn"),
      gap(0.5),
      key("VolumeMute", "🔇", "fn"),
      key("VolumeDown", "🔉", "fn"),
      key("VolumeUp", "🔊", "fn"),
    ],
    mid: [],
    numpad: [],
  },
  {
    main: [
      key("Backquote", "`", "main", undefined, { label2: "~" }),
      key("Digit1", "1", "main"),
      key("Digit2", "2", "main"),
      key("Digit3", "3", "main"),
      key("Digit4", "4", "main"),
      key("Digit5", "5", "main"),
      key("Digit6", "6", "main"),
      key("Digit7", "7", "main"),
      key("Digit8", "8", "main"),
      key("Digit9", "9", "main"),
      key("Digit0", "0", "main"),
      key("Minus", "-", "main", undefined, { label2: "_" }),
      key("Equal", "=", "main", undefined, { label2: "+" }),
      key("Backspace", "Back", "main", 2),
    ],
    mid: [
      key("Insert", "Ins", "nav"),
      key("Home", "Home", "nav"),
      key("PageUp", "PgUp", "nav"),
    ],
    numpad: [],
  },
  {
    main: [
      key("Tab", "Tab", "main", 1.5),
      key("KeyQ", "Q", "main"),
      key("KeyW", "W", "main"),
      key("KeyE", "E", "main"),
      key("KeyR", "R", "main"),
      key("KeyT", "T", "main"),
      key("KeyY", "Y", "main"),
      key("KeyU", "U", "main"),
      key("KeyI", "I", "main"),
      key("KeyO", "O", "main"),
      key("KeyP", "P", "main"),
      key("BracketLeft", "[", "main", undefined, { label2: "{" }),
      key("BracketRight", "]", "main", undefined, { label2: "}" }),
      key("Backslash", "\\", "main", 1.5, { label2: "|" }),
    ],
    mid: [
      key("Delete", "Del", "nav"),
      key("End", "End", "nav"),
      key("PageDown", "PgDn", "nav"),
    ],
    numpad: [],
  },
  {
    // Search/Launcher key replaces Caps Lock. DOM code is MetaLeft.
    main: [
      key("MetaLeft", "Search", "main", 1.75),
      key("KeyA", "A", "main"),
      key("KeyS", "S", "main"),
      key("KeyD", "D", "main"),
      key("KeyF", "F", "main"),
      key("KeyG", "G", "main"),
      key("KeyH", "H", "main"),
      key("KeyJ", "J", "main"),
      key("KeyK", "K", "main"),
      key("KeyL", "L", "main"),
      key("Semicolon", ";", "main", undefined, { label2: ":" }),
      key("Quote", "'", "main", undefined, { label2: '"' }),
      key("Enter", "Enter", "main", 2.25),
    ],
    mid: [],
    numpad: [],
  },
  {
    main: [
      key("ShiftLeft", "Shift", "mods", 2.25),
      key("KeyZ", "Z", "main"),
      key("KeyX", "X", "main"),
      key("KeyC", "C", "main"),
      key("KeyV", "V", "main"),
      key("KeyB", "B", "main"),
      key("KeyN", "N", "main"),
      key("KeyM", "M", "main"),
      key("Comma", ",", "main", undefined, { label2: "<" }),
      key("Period", ".", "main", undefined, { label2: ">" }),
      key("Slash", "/", "main", undefined, { label2: "?" }),
      key("ShiftRight", "Shift", "mods", 2.75),
    ],
    mid: [
      gap(1),
      key("ArrowUp", "↑", "arrows"),
      gap(1),
    ],
    numpad: [],
  },
  {
    // No Meta/Win or Menu keys: Ctrl Alt Space Alt Ctrl (Chromebook bottom row).
    main: [
      key("ControlLeft", "Ctrl", "mods", 1.25),
      key("AltLeft", "Alt", "mods", 1.25),
      key("Space", "Space", "main", 6.25),
      key("AltRight", "Alt", "mods", 1.25),
      key("ControlRight", "Ctrl", "mods", 1.25),
    ],
    mid: [
      key("ArrowLeft", "←", "arrows"),
      key("ArrowDown", "↓", "arrows"),
      key("ArrowRight", "→", "arrows"),
    ],
    numpad: [],
  },
];

function filterCluster(
  items: RowItem[],
  allowed: Set<KeyDef["region"]>,
  stripEdges = true,
): RowItem[] {
  const next: RowItem[] = [];
  for (const item of items) {
    if (item.kind === "gap") {
      next.push(item);
      continue;
    }
    if (!allowed.has(item.region)) continue;
    next.push(item);
  }
  const hasKey = next.some(isKey);
  if (!hasKey) return [];
  if (stripEdges) {
    while (next.length && next[0].kind === "gap") next.shift();
    while (next.length && next[next.length - 1].kind === "gap") next.pop();
  }
  return next;
}

function isKey(item: RowItem): item is KeyDef {
  return item.kind !== "gap";
}

/** ChromeOS board for a size, filtered exactly like the ANSI board. */
export function getChromeosRows(size: SizeLayout): BoardRow[] {
  const allowed = SIZE_REGIONS[size];
  return CHROMEOS_BOARD.map((row) => {
    const main = filterCluster(row.main, allowed);
    const mid = filterCluster(row.mid, allowed, false);
    return { main, mid, numpad: [] };
  }).filter((row) => row.main.some(isKey) || row.mid.some(isKey));
}
