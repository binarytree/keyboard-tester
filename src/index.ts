/**
 * keyboard-tester — pure keyboard-domain logic.
 * No DOM UI, no Astro, no brand copy. Safe for any framework.
 */

export {
  ANSI_BOARD,
  ISO_BOARD,
  isKey,
  macifyKey,
  detectOsLayout,
  getBoardRows,
  flattenKeys,
  clusterCssWidth,
  type OsLayout,
  type SizeLayout,
  type FormLayout,
  type KeyDef,
  type SpacerDef,
  type RowItem,
  type BoardRow,
} from "./layouts";

export { SIZE_REGIONS } from "./regions";

export {
  normalizeChromeosCode,
  getChromeosRows,
  CHROMEOS_BOARD,
  type ChromeosCode,
} from "./chromeosLayout";

export {
  emptyKeyState,
  keyStateReducer,
  STUCK_HOLD_MS,
  type KeyKind,
  type KeyPress,
  type KeyState,
  type KeyAction,
} from "./keyState";

export { shouldPreventBrowserKey } from "./keyboardEvents";

export {
  keyDisplayName,
  partitionKeys,
  formatNames,
  formatReport,
  type ReportKey,
  type ReportPartition,
  type ReportMeta,
  type ReportStrings,
} from "./keyReport";

export { estimateRate, type RateEstimate } from "./pollingRate";

export {
  boardColumnStyle,
  boardHasMid,
  boardHasNumpad,
} from "./boardColumns";
