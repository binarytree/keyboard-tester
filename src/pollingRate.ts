/**
 * Polling-rate estimation for the browser keyboard tester.
 *
 * A keyboard's polling rate quantizes keydown timestamps: a 125 Hz board
 * reports on an 8 ms grid, a 1000 Hz board on ~1 ms. We measure the grid
 * in the timestamp intervals and map it to the closest standard rate.
 */

export interface RateEstimate {
  hz: number | null;
  avgMs: number;
}

const CANDIDATES = [
  { t: 8, hz: 125 },
  { t: 4, hz: 250 },
  { t: 2, hz: 500 },
  { t: 1, hz: 1000 },
] as const;

/**
 * Real grid quantization error is far below this; a non-matching grid
 * scatters errors uniformly, so a strict tolerance separates them.
 * T=1 always aligns (any real number is on a 1 ms grid), so it acts as
 * the 1000 Hz fallback.
 */
const TOLERANCE_MS = 0.8;
const ALIGNMENT_RATIO = 0.9;
/** Pauses above this are human hesitation, not report cadence. */
const MAX_GAP_MS = 1000;
const MIN_DELTAS = 8;

/**
 * Estimate the polling rate from a burst of keydown timestamps.
 *
 * Coarse grids are tested first: a 125 Hz board's intervals are also
 * multiples of 2 ms and 1 ms, so only the coarsest matching grid is
 * meaningful. Returns `hz: null` when fewer than 8 usable intervals exist.
 */
export function estimateRate(timestamps: number[]): RateEstimate {
  const deltas: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const d = timestamps[i] - timestamps[i - 1];
    if (d > 0 && d <= MAX_GAP_MS) deltas.push(d);
  }
  if (deltas.length < MIN_DELTAS) return { hz: null, avgMs: 0 };

  const avgMs = deltas.reduce((s, d) => s + d, 0) / deltas.length;

  for (const { t, hz } of CANDIDATES) {
    const aligned = deltas.filter(
      (d) => Math.abs(d - Math.round(d / t) * t) <= TOLERANCE_MS,
    ).length;
    if (aligned / deltas.length >= ALIGNMENT_RATIO) return { hz, avgMs };
  }
  return { hz: null, avgMs };
}
