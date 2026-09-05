import { describe, expect, it } from "vitest";
import {
  formatNames,
  formatReport,
  keyDisplayName,
  partitionKeys,
  type ReportStrings,
} from "./keyReport";

const keys = [
  { code: "Escape", label: "Esc" },
  { code: "KeyA", label: "A" },
  { code: "ShiftLeft", label: "Shift" },
  { code: "ShiftRight", label: "Shift" },
  { code: "F1", label: "F1" },
];

const copy: ReportStrings = {
  heading: "Keyboard test — example.com",
  metaLine: (date, os, size, checked, total) =>
    `${date} · ${os} · ${size} · ${checked}/${total} keys checked`,
  stuckLine: (n, names) => `Stuck (${n}): ${names}`,
  missedLine: (n, names) => `Didn't register (${n}): ${names}`,
  untestedLine: (n, names) => `Not pressed (${n}): ${names}`,
  legend: "Green = released OK. Amber = press with no release.",
  missedNote:
    '"Didn\'t register" = pressed on the real board, no event in the browser.',
  fnNote: "Fn and media keys often never reach the browser.",
};

describe("keyDisplayName", () => {
  it("prefixes Left/Right on physical sides", () => {
    expect(keyDisplayName("ShiftLeft", "Shift")).toBe("Left Shift");
    expect(keyDisplayName("ControlRight", "Ctrl")).toBe("Right Ctrl");
    expect(keyDisplayName("Escape", "Esc")).toBe("Esc");
  });
});

describe("partitionKeys", () => {
  it("splits by state and skips keys still held", () => {
    const part = partitionKeys(
      keys,
      { KeyA: "tested", ShiftLeft: "stuck", F1: "missed" },
      new Set(["Escape"]),
    );
    expect(part.tested.map((k) => k.code)).toEqual(["KeyA"]);
    expect(part.stuck.map((k) => k.code)).toEqual(["ShiftLeft"]);
    expect(part.missed.map((k) => k.code)).toEqual(["F1"]);
    expect(part.untested.map((k) => k.code)).toEqual(["ShiftRight"]);
  });
});

describe("formatReport", () => {
  it("builds a clipboard slip without typed characters", () => {
    const part = partitionKeys(
      keys,
      { KeyA: "tested", ShiftLeft: "stuck", F1: "missed" },
      new Set(),
    );
    const text = formatReport(
      part,
      {
        date: "2026-08-13",
        osLabel: "Windows",
        sizeLabel: "TKL",
        url: "https://example.com/",
      },
      copy,
    );
    expect(text).toBe(
      [
        "Keyboard test — example.com",
        "2026-08-13 · Windows · TKL · 3/5 keys checked",
        "",
        "Stuck (1): Left Shift",
        "Didn't register (1): F1",
        "Not pressed (2): Esc, Right Shift",
        "",
        "Green = released OK. Amber = press with no release.",
        '"Didn\'t register" = pressed on the real board, no event in the browser.',
        "Fn and media keys often never reach the browser.",
        "https://example.com/",
      ].join("\n"),
    );
    expect(text).not.toContain("key=");
    expect(formatNames(part.stuck)).toBe("Left Shift");
  });

  it("omits empty finding lines", () => {
    const part = partitionKeys(keys, { Escape: "tested" }, new Set());
    const text = formatReport(
      part,
      {
        date: "2026-08-13",
        osLabel: "Mac",
        sizeLabel: "60%",
        url: "https://example.com/mac/",
      },
      copy,
    );
    expect(text).not.toMatch(/^Stuck /m);
    expect(text).not.toMatch(/^Didn't register \(/m);
    expect(text).toContain("Not pressed (4):");
  });
});
