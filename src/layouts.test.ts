import { describe, expect, it } from "vitest";
import {
  ANSI_BOARD,
  ISO_BOARD,
  getBoardRows,
  flattenKeys,
  macifyKey,
} from "./layouts";

describe("ANSI_BOARD & ISO_BOARD layouts", () => {
  it("ANSI full-size layout has standard 15u width rows", () => {
    const keys = flattenKeys(ANSI_BOARD);
    expect(keys.length).toBeGreaterThan(80);
    expect(keys.some((k) => k.code === "Enter")).toBe(true);
    expect(keys.some((k) => k.code === "Backslash")).toBe(true);
  });

  it("ISO full-size layout includes IntlBackslash, one Enter, and 15u letter rows", () => {
    const keys = flattenKeys(ISO_BOARD);
    expect(keys.some((k) => k.code === "IntlBackslash")).toBe(true);
    expect(keys.some((k) => k.code === "ShiftLeft" && k.w === 1.25)).toBe(true);
    expect(keys.filter((k) => k.code === "Enter")).toHaveLength(1);

    for (let r = 1; r < ISO_BOARD.length; r++) {
      const row = ISO_BOARD[r];
      const sumUnits = row.main.reduce((s, k) => s + (k.w ?? 1), 0);
      expect(sumUnits).toBe(15);
    }
  });

  it("getBoardRows returns ISO board when form='iso'", () => {
    const ansiKeys = flattenKeys(getBoardRows("win", "tkl", "ansi"));
    const isoKeys = flattenKeys(getBoardRows("win", "tkl", "iso"));
    expect(ansiKeys.some((k) => k.code === "IntlBackslash")).toBe(false);
    expect(isoKeys.some((k) => k.code === "IntlBackslash")).toBe(true);
  });

  it("ChromeOS ignores ISO and returns ChromeOS specific layout", () => {
    const chromeKeys = flattenKeys(getBoardRows("chromeos", "tkl", "iso"));
    expect(chromeKeys.some((k) => k.label === "Search")).toBe(true);
  });

  it("shortens Mac labels that would overflow a 1.25u key", () => {
    const iso = flattenKeys(getBoardRows("mac", "60", "iso"));
    const shift = iso.find((k) => k.code === "ShiftLeft");
    const enter = iso.find((k) => k.code === "Enter");
    expect(shift?.label).toBe("⇧");
    expect(enter?.label).toBe("↩");
    expect(shift?.label).not.toMatch(/\.\.\./);
    expect(enter?.label).not.toMatch(/\.\.\./);
  });
});
