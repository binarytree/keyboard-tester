/**
 * Local test report: partition visible keys and format a clipboard slip.
 * No typed characters — labels and codes from the layout only.
 */

import type { KeyKind } from "./keyState";

export interface ReportKey {
  code: string;
  label: string;
}

export interface ReportPartition {
  tested: ReportKey[];
  stuck: ReportKey[];
  missed: ReportKey[];
  untested: ReportKey[];
}

export interface ReportMeta {
  date: string;
  osLabel: string;
  sizeLabel: string;
  url: string;
}

export interface ReportStrings {
  heading: string;
  metaLine: (
    date: string,
    os: string,
    size: string,
    checked: number,
    total: number,
  ) => string;
  stuckLine: (n: number, names: string) => string;
  missedLine: (n: number, names: string) => string;
  untestedLine: (n: number, names: string) => string;
  legend: string;
  missedNote: string;
  fnNote: string;
}

/** Left/Right physical keys share a short label on the board. */
export function keyDisplayName(code: string, label: string): string {
  if (code.endsWith("Left")) return `Left ${label}`;
  if (code.endsWith("Right")) return `Right ${label}`;
  return label;
}

export function partitionKeys(
  keys: ReportKey[],
  states: Record<string, KeyKind>,
  held: ReadonlySet<string>,
): ReportPartition {
  const tested: ReportKey[] = [];
  const stuck: ReportKey[] = [];
  const missed: ReportKey[] = [];
  const untested: ReportKey[] = [];
  for (const key of keys) {
    if (held.has(key.code)) continue;
    const kind = states[key.code];
    if (kind === "tested") tested.push(key);
    else if (kind === "stuck") stuck.push(key);
    else if (kind === "missed") missed.push(key);
    else untested.push(key);
  }
  return { tested, stuck, missed, untested };
}

export function formatNames(keys: ReportKey[]): string {
  return keys.map((k) => keyDisplayName(k.code, k.label)).join(", ");
}

export function formatReport(
  part: ReportPartition,
  meta: ReportMeta,
  t: ReportStrings,
): string {
  const checked = part.tested.length + part.stuck.length + part.missed.length;
  const total = checked + part.untested.length;
  const lines = [
    t.heading,
    t.metaLine(meta.date, meta.osLabel, meta.sizeLabel, checked, total),
    "",
  ];
  if (part.stuck.length) {
    lines.push(t.stuckLine(part.stuck.length, formatNames(part.stuck)));
  }
  if (part.missed.length) {
    lines.push(t.missedLine(part.missed.length, formatNames(part.missed)));
  }
  if (part.untested.length) {
    lines.push(t.untestedLine(part.untested.length, formatNames(part.untested)));
  }
  lines.push("", t.legend, t.missedNote, t.fnNote, meta.url);
  return lines.join("\n");
}
