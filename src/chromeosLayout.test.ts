import { describe, expect, it } from "vitest";
import {
  CHROMEOS_BOARD,
  getChromeosRows,
  normalizeChromeosCode,
} from "./chromeosLayout";
import { flattenKeys } from "./layouts";

describe("normalizeChromeosCode", () => {
  it("maps F1-F10 to the ChromeOS action codes (function-key mode)", () => {
    expect(normalizeChromeosCode("F1")).toBe("BrowserBack");
    expect(normalizeChromeosCode("F2")).toBe("BrowserForward");
    expect(normalizeChromeosCode("F3")).toBe("BrowserRefresh");
    expect(normalizeChromeosCode("F4")).toBe("ZoomToggle");
    expect(normalizeChromeosCode("F5")).toBe("SelectTask");
    expect(normalizeChromeosCode("F6")).toBe("BrightnessDown");
    expect(normalizeChromeosCode("F7")).toBe("BrightnessUp");
    expect(normalizeChromeosCode("F8")).toBe("VolumeMute");
    expect(normalizeChromeosCode("F9")).toBe("VolumeDown");
    expect(normalizeChromeosCode("F10")).toBe("VolumeUp");
  });

  it("leaves already-correct action codes and ordinary keys untouched", () => {
    expect(normalizeChromeosCode("BrowserBack")).toBe("BrowserBack");
    expect(normalizeChromeosCode("BrightnessUp")).toBe("BrightnessUp");
    expect(normalizeChromeosCode("KeyA")).toBe("KeyA");
    expect(normalizeChromeosCode("Space")).toBe("Space");
    expect(normalizeChromeosCode("F11")).toBe("F11"); // outside top-row map
  });
});

describe("CHROMEOS_BOARD", () => {
  it("uses Search (MetaLeft) in the Caps Lock position", () => {
    const keys = flattenKeys(CHROMEOS_BOARD);
    const search = keys.find((k) => k.label === "Search");
    expect(search).toBeDefined();
    expect(search?.code).toBe("MetaLeft");
    // No CapsLock anywhere on the board
    expect(keys.some((k) => k.code === "CapsLock")).toBe(false);
  });

  it("top row is action keys, not F1-F12", () => {
    const keys = flattenKeys(CHROMEOS_BOARD);
    const topCodes = keys
      .filter((k) => k.region === "fn")
      .map((k) => k.code);
    expect(topCodes).toContain("BrowserBack");
    expect(topCodes).toContain("BrightnessDown");
    expect(topCodes).toContain("VolumeUp");
    // No F1..F12 in the top row
    expect(topCodes.some((c) => /^F\d+$/.test(c))).toBe(false);
  });

  it("has no Win/Meta or Menu keys on the bottom row (Search replaces them)", () => {
    const keys = flattenKeys(CHROMEOS_BOARD);
    expect(keys.some((k) => k.label === "Win")).toBe(false);
    expect(keys.some((k) => k.label === "Menu")).toBe(false);
    expect(keys.some((k) => k.code === "ContextMenu")).toBe(false);
  });

  it("has no numpad (Chromebooks don't ship one)", () => {
    const keys = flattenKeys(CHROMEOS_BOARD);
    expect(keys.some((k) => k.region === "numpad")).toBe(false);
  });

  it("has no PrtSc/ScrLk/Pause system block", () => {
    const keys = flattenKeys(CHROMEOS_BOARD);
    for (const code of ["PrintScreen", "ScrollLock", "Pause"]) {
      expect(keys.some((k) => k.code === code)).toBe(false);
    }
  });
});

describe("getChromeosRows", () => {
  it("collapses by size: dropping top row (65) and nav cluster (60)", () => {
    const p75 = flattenKeys(getChromeosRows("75")).length;
    const p65 = flattenKeys(getChromeosRows("65")).length;
    const p60 = flattenKeys(getChromeosRows("60")).length;
    // 75 keeps the top row; 65 drops it; 60 drops nav + arrows too.
    expect(p75).toBeGreaterThan(p65);
    expect(p65).toBeGreaterThan(p60);
  });

  it("full and tkl are identical (ChromeOS has no numpad or sys block)", () => {
    const full = flattenKeys(getChromeosRows("full")).length;
    const tkl = flattenKeys(getChromeosRows("tkl")).length;
    expect(full).toBe(tkl);
  });

  it("60% keeps Search but drops the top row", () => {
    const keys = flattenKeys(getChromeosRows("60"));
    expect(keys.some((k) => k.code === "MetaLeft")).toBe(true);
    expect(keys.some((k) => k.code === "BrowserBack")).toBe(false);
  });

  it("Search key position matches the Caps Lock slot width (1.75u)", () => {
    const row4 = CHROMEOS_BOARD[3].main;
    const search = row4.find((k) => k.kind !== "gap" && k.code === "MetaLeft");
    expect(search).toBeDefined();
    if (search && search.kind !== "gap") expect(search.w).toBe(1.75);
  });
});
