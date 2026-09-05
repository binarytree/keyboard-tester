import { describe, expect, it } from "vitest";
import { estimateRate } from "./pollingRate";

/** Deterministic PRNG so the jitter in tests can't randomly flip a verdict. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build timestamps from a simulated human cadence quantized to a grid. */
function quantizedBurst(
  intervalMs: number,
  gridMs: number,
  count = 25,
  jitterMs = 2,
  seed = 42,
): number[] {
  const rand = mulberry32(seed);
  const t0 = 1_000_000;
  const stamps: number[] = [];
  for (let i = 1; i <= count; i++) {
    const raw = t0 + i * intervalMs + (rand() * 2 - 1) * jitterMs;
    stamps.push(Math.round(raw / gridMs) * gridMs);
  }
  return stamps;
}

describe("estimateRate", () => {
  it("detects a 125 Hz board (8 ms grid)", () => {
    const { hz, avgMs } = estimateRate(quantizedBurst(30, 8));
    expect(hz).toBe(125);
    expect(avgMs).toBeGreaterThan(0);
  });

  it("detects a 250 Hz board (4 ms grid)", () => {
    const { hz } = estimateRate(quantizedBurst(30, 4));
    expect(hz).toBe(250);
  });

  it("detects a 500 Hz board (2 ms grid)", () => {
    const { hz } = estimateRate(quantizedBurst(30, 2));
    expect(hz).toBe(500);
  });

  it("treats a fine/unquantized grid as 1000 Hz", () => {
    // 0.25 ms quantization ≈ effectively unquantized vs the 8/4/2 ms grids
    const { hz } = estimateRate(quantizedBurst(30, 0.25));
    expect(hz).toBe(1000);
  });

  it("does not misread a true 1 ms grid as 500 Hz (tolerance regression)", () => {
    // Intervals that sit between the 2 ms grid marks (e.g. 30.9) must not
    // align to 2 ms under the 0.8 ms tolerance.
    const stamps: number[] = [];
    for (let i = 1; i <= 25; i++) stamps.push(1_000_000 + i * 30.9);
    const { hz } = estimateRate(stamps);
    expect(hz).toBe(1000);
  });

  it("returns null with too few usable intervals", () => {
    const { hz } = estimateRate([1_000_000, 1_000_008]);
    expect(hz).toBeNull();
  });

  it("ignores pauses longer than 1 second", () => {
    // 24 fast taps then a long pause: the pause must not break the grid.
    const fast = quantizedBurst(30, 8, 24);
    const stamps = [...fast, fast[fast.length - 1] + 5000];
    const { hz } = estimateRate(stamps);
    expect(hz).toBe(125);
  });
});
