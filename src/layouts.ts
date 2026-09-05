import { SIZE_REGIONS } from "./regions";
import { getChromeosRows } from "./chromeosLayout";

export type OsLayout = "win" | "mac" | "chromeos";
export type SizeLayout = "full" | "tkl" | "75" | "65" | "60";
export type FormLayout = "ansi" | "iso";

export type KeyDef = {
  kind?: "key";
  code: string;
  label: string;
  /** Width in key units (1 = standard alphanumeric) */
  w?: number;
  /** Secondary sub-legend (shift symbol) rendered under the main label */
  label2?: string;
  /** Vertical span in numpad grid rows (2 = tall key like + or Enter) */
  spanY?: number;
  region: "main" | "fn" | "sys" | "nav" | "arrows" | "numpad" | "mods";
};

export type SpacerDef = {
  kind: "gap";
  w: number;
};

export type RowItem = KeyDef | SpacerDef;

/** One physical keyboard row as three aligned clusters */
export type BoardRow = {
  main: RowItem[];
  /** Nav cluster or arrow cluster */
  mid: RowItem[];
  numpad: RowItem[];
};

const key = (
  code: string,
  label: string,
  region: KeyDef["region"],
  w?: number,
  extra?: Partial<Pick<KeyDef, "label2" | "spanY">>,
): KeyDef => ({ code, label, region, w, ...extra });

const gap = (w: number): SpacerDef => ({ kind: "gap", w });

/**
 * Full-size ANSI layout split into main | mid | numpad so columns stay aligned.
 */
export const ANSI_BOARD: BoardRow[] = [
  {
    main: [
      /* F-row is left-aligned with the digit row: Esc over `, F1 over 1.
         Group gaps only sit between F4|F5 and F8|F9 (like a real TKL);
         no gap after Esc so the columns line up. */
      key("Escape", "Esc", "fn"),
      key("F1", "F1", "fn"),
      key("F2", "F2", "fn"),
      key("F3", "F3", "fn"),
      key("F4", "F4", "fn"),
      gap(0.5),
      key("F5", "F5", "fn"),
      key("F6", "F6", "fn"),
      key("F7", "F7", "fn"),
      key("F8", "F8", "fn"),
      gap(0.5),
      key("F9", "F9", "fn"),
      key("F10", "F10", "fn"),
      key("F11", "F11", "fn"),
      key("F12", "F12", "fn"),
    ],
    mid: [
      key("PrintScreen", "PrtSc", "sys"),
      key("ScrollLock", "ScrLk", "sys"),
      key("Pause", "Pause", "sys"),
    ],
    numpad: [],
  },
  {
    main: [
      key("Backquote", "`", "main", undefined, { label2: "~" }),
      key("Digit1", "1", "main", undefined, { label2: "!" }),
      key("Digit2", "2", "main", undefined, { label2: "@" }),
      key("Digit3", "3", "main", undefined, { label2: "#" }),
      key("Digit4", "4", "main", undefined, { label2: "$" }),
      key("Digit5", "5", "main", undefined, { label2: "%" }),
      key("Digit6", "6", "main", undefined, { label2: "^" }),
      key("Digit7", "7", "main", undefined, { label2: "&" }),
      key("Digit8", "8", "main", undefined, { label2: "*" }),
      key("Digit9", "9", "main", undefined, { label2: "(" }),
      key("Digit0", "0", "main", undefined, { label2: ")" }),
      key("Minus", "-", "main", undefined, { label2: "_" }),
      key("Equal", "=", "main", undefined, { label2: "+" }),
      key("Backspace", "⌫ Back", "main", 2),
    ],
    mid: [
      key("Insert", "Ins", "nav"),
      key("Home", "Home", "nav"),
      key("PageUp", "PgUp", "nav"),
    ],
    numpad: [
      key("NumLock", "Num", "numpad"),
      key("NumpadDivide", "/", "numpad"),
      key("NumpadMultiply", "*", "numpad"),
      key("NumpadSubtract", "-", "numpad"),
    ],
  },
  {
    main: [
      key("Tab", "⇥ Tab", "main", 1.5),
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
    numpad: [
      key("Numpad7", "7", "numpad"),
      key("Numpad8", "8", "numpad"),
      key("Numpad9", "9", "numpad"),
      key("NumpadAdd", "+", "numpad", undefined, { spanY: 2 }),
    ],
  },
  {
    main: [
      key("CapsLock", "⇪ Caps", "main", 1.75),
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
      key("Enter", "↵ Enter", "main", 2.25),
    ],
    mid: [],
    numpad: [
      key("Numpad4", "4", "numpad"),
      key("Numpad5", "5", "numpad"),
      key("Numpad6", "6", "numpad"),
    ],
  },
  {
    main: [
      key("ShiftLeft", "⇧ Shift", "mods", 2.25),
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
      key("ShiftRight", "⇧ Shift", "mods", 2.75),
    ],
    mid: [
      // empty left cell keeps ↑ in the center of the 3-wide mid cluster
      gap(1),
      key("ArrowUp", "↑", "arrows"),
      gap(1),
    ],
    numpad: [
      key("Numpad1", "1", "numpad"),
      key("Numpad2", "2", "numpad"),
      key("Numpad3", "3", "numpad"),
      key("NumpadEnter", "Ent", "numpad", undefined, { spanY: 2 }),
    ],
  },
  {
    main: [
      key("ControlLeft", "Ctrl", "mods", 1.25),
      key("MetaLeft", "⊞ Win", "mods", 1.25),
      key("AltLeft", "Alt", "mods", 1.25),
      key("Space", "Space", "main", 6.25),
      key("AltRight", "Alt", "mods", 1.25),
      key("MetaRight", "⊞ Win", "mods", 1.25),
      key("ContextMenu", "Menu", "mods", 1.25),
      key("ControlRight", "Ctrl", "mods", 1.25),
    ],
    mid: [
      key("ArrowLeft", "←", "arrows"),
      key("ArrowDown", "↓", "arrows"),
      key("ArrowRight", "→", "arrows"),
    ],
    numpad: [
      key("Numpad0", "0", "numpad", 2),
      key("NumpadDecimal", ".", "numpad"),
    ],
  },
];

/**
 * Full-size ISO layout (UK, Europe, Spanish ISO): short Left Shift,
 * IntlBackslash, and a single Enter on the home row. The Q-row leaves a
 * 1.5u hole where an L-shaped Enter stem would sit (main cluster is flex,
 * so Enter cannot span two rows).
 */
export const ISO_BOARD: BoardRow[] = [
  ANSI_BOARD[0],
  ANSI_BOARD[1],
  {
    main: [
      key("Tab", "⇥ Tab", "main", 1.5),
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
      gap(1.5),
    ],
    mid: ANSI_BOARD[2].mid,
    numpad: ANSI_BOARD[2].numpad,
  },
  {
    main: [
      key("CapsLock", "⇪ Caps", "main", 1.75),
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
      key("Backslash", "\\", "main", undefined, { label2: "|" }),
      key("Enter", "Enter", "main", 1.25),
    ],
    mid: ANSI_BOARD[3].mid,
    numpad: ANSI_BOARD[3].numpad,
  },
  {
    main: [
      key("ShiftLeft", "Shift", "mods", 1.25),
      key("IntlBackslash", "<", "main", 1, { label2: ">" }),
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
      key("ShiftRight", "⇧ Shift", "mods", 2.75),
    ],
    mid: ANSI_BOARD[4].mid,
    numpad: ANSI_BOARD[4].numpad,
  },
  ANSI_BOARD[5],
];

export function isKey(item: RowItem): item is KeyDef {
  return item.kind !== "gap";
}

export function macifyKey(k: KeyDef): KeyDef {
  if (k.code === "MetaLeft" || k.code === "MetaRight") {
    return { ...k, label: "⌘ Cmd" };
  }
  if (k.code === "AltLeft" || k.code === "AltRight") {
    return { ...k, label: "⌥ Opt" };
  }
  if (k.code === "ControlLeft" || k.code === "ControlRight") {
    return { ...k, label: "⌃ Ctrl" };
  }
  if (k.code === "Backspace") {
    return { ...k, label: (k.w ?? 2) < 1.75 ? "⌫" : "⌫ Delete" };
  }
  if (k.code === "Enter") {
    return { ...k, label: (k.w ?? 2) < 2 ? "↩" : "↩ Return" };
  }
  if (k.code === "ShiftLeft" || k.code === "ShiftRight") {
    return { ...k, label: (k.w ?? 2) < 1.75 ? "⇧" : "⇧ Shift" };
  }
  return k;
}

/** Detect OS for default Win/Mac layout labels (user can still override). */
export function detectOsLayout(): OsLayout {
  if (typeof navigator === "undefined") return "win";

  const uaData = (
    navigator as Navigator & {
      userAgentData?: { platform?: string };
    }
  ).userAgentData;
  const platform = `${uaData?.platform ?? ""} ${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;

  if (/Mac|iPhone|iPad|iPod|Macintosh/i.test(platform)) return "mac";
  return "win";
}

function filterCluster(
  items: RowItem[],
  allowed: Set<KeyDef["region"]>,
  os: OsLayout,
  /** Strip leading/trailing gaps (main-row padding). Mid/numpad gaps
   *  are positioning (e.g. gap ↑ gap centers the arrow) — keep them. */
  stripEdges = true,
): RowItem[] {
  const next: RowItem[] = [];
  for (const item of items) {
    if (item.kind === "gap") {
      next.push(item);
      continue;
    }
    if (!allowed.has(item.region)) continue;
    next.push(os === "mac" ? macifyKey(item) : item);
  }
  // strip pure-gap clusters and edge gaps that only pad missing keys
  const hasKey = next.some(isKey);
  if (!hasKey) return [];
  if (stripEdges) {
    while (next.length && next[0].kind === "gap") next.shift();
    while (next.length && next[next.length - 1].kind === "gap") next.pop();
  }
  return next;
}

export function getBoardRows(
  os: OsLayout,
  size: SizeLayout,
  form: FormLayout = "ansi",
): BoardRow[] {
  if (os === "chromeos") {
    return getChromeosRows(size);
  }
  const base = form === "iso" ? ISO_BOARD : ANSI_BOARD;
  const allowed = SIZE_REGIONS[size];
  return base
    .map((row) => {
      const main = filterCluster(row.main, allowed, os);
      const mid = filterCluster(row.mid, allowed, os, false);
      const numpad = filterCluster(row.numpad, allowed, os);
      return { main, mid, numpad };
    })
    .filter(
      (row) =>
        row.main.some(isKey) || row.mid.some(isKey) || row.numpad.some(isKey),
    );
}


export function flattenKeys(rows: BoardRow[] | RowItem[][]): KeyDef[] {
  if (!rows.length) return [];
  // BoardRow[]
  if ("main" in rows[0]) {
    return (rows as BoardRow[]).flatMap((r) =>
      [...r.main, ...r.mid, ...r.numpad].filter(isKey),
    );
  }
  return (rows as RowItem[][]).flatMap((row) => row.filter(isKey));
}

/** CSS length for a cluster: sum of unit widths + flex gaps between children */
export function clusterCssWidth(items: RowItem[]): string {
  if (!items.length) return "0px";
  const units = items.reduce((sum, item) => {
    if (item.kind === "gap") return sum + item.w;
    return sum + (item.w ?? 1);
  }, 0);
  const gaps = Math.max(0, items.length - 1);
  return `calc(${units} * var(--key-unit) + ${gaps} * var(--key-gap))`;
}
