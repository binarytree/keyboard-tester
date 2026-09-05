import { clusterCssWidth, type BoardRow } from "./layouts";

/** CSS custom-property string for aligned main | mid | numpad columns. */
export function boardColumnStyle(boardRows: BoardRow[]): string {
  const pick = (sel: keyof BoardRow) => {
    let best = "";
    let bestScore = -1;
    for (const r of boardRows) {
      const items = r[sel];
      if (!items.length) continue;
      let units = 0;
      for (const it of items) {
        units += it.kind === "gap" ? it.w : (it.w ?? 1);
      }
      const score = units * 100 + items.length;
      if (score > bestScore) {
        bestScore = score;
        best = clusterCssWidth(items);
      }
    }
    return best || "0px";
  };

  return `--main-w:${pick("main")};--mid-w:${pick("mid")};--num-w:${pick("numpad")}`;
}

export function boardHasMid(boardRows: BoardRow[]): boolean {
  return boardRows.some((r) => r.mid.length > 0);
}

export function boardHasNumpad(boardRows: BoardRow[]): boolean {
  return boardRows.some((r) => r.numpad.length > 0);
}
