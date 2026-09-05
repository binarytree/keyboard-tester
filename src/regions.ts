import type { SizeLayout } from "./layouts";

/**
 * Which key regions survive at each physical size. Shared by the ANSI
 * (win/mac) and ChromeOS boards so both collapse identically.
 */
export const SIZE_REGIONS: Record<SizeLayout, Set<KeyDef["region"]>> = {
  full: new Set(["main", "fn", "sys", "nav", "arrows", "numpad", "mods"]),
  tkl: new Set(["main", "fn", "sys", "nav", "arrows", "mods"]),
  /* 75% keeps the F-row but drops the PrtSc block — nav keys hug the right edge */
  "75": new Set(["main", "fn", "nav", "arrows", "mods"]),
  /* 65%: no F-row, no PrtSc block — only the edit cluster + arrows */
  "65": new Set(["main", "nav", "arrows", "mods"]),
  "60": new Set(["main", "mods"]),
};

type KeyDef = { region: string };
