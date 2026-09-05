# keyboard-tester

Open-source core for browser-based keyboard testers, powering
[keyboardtestonline.com](https://keyboardtestonline.com). TypeScript, zero
runtime dependencies, no server. Every keypress stays in the browser.

## A real ChromeOS keyboard layout

Most "Chromebook keyboard tester" projects are Windows keyboards with
different key labels. This one is a faithful ChromeOS layout: Search replaces
Caps Lock, the top row is real Chromebook action keys (Back, Refresh, Full
screen, brightness, volume) that report their browser codes, and there is no
numpad or PrtSc block. `normalizeChromeosCode` maps F1-F10 back to the action
codes for Chromebooks in function-key mode.

## Why this is open source

Privacy claims are easy to make and hard to check. This repo is the checkable
half of the promise: **nothing you type leaves the browser**, because the
input handling here only ever produces a local state object. No network call,
no telemetry, no data model that could carry keystrokes anywhere.

Review the pieces that matter:

- `src/keyState.ts`, the state machine a keypress moves through. Every
  transition is pure and local.
- `src/keyboardEvents.ts`, which browser keys the tester should swallow so
  the page itself does not trigger shortcuts while you test.
- `src/keyReport.ts`, which builds a text report from key labels and codes
  only. It never has access to what you typed, because it was never collected.

## Layouts

- ANSI and ISO boards, with Windows and Mac label variants.
- ChromeOS, described above: Search instead of Caps Lock, action-key top row,
  no numpad. This is the layout a school IT check or a used-Chromebook buyer
  actually needs.

Layouts collapse by size (full, TKL, 75%, 65%, 60%) while keeping columns
aligned.

## Usage

```ts
import {
  getBoardRows,
  keyStateReducer,
  shouldPreventBrowserKey,
} from "./src/index";

const rows = getBoardRows("chromeos", "full");
let state = emptyKeyState();

document.addEventListener("keydown", (e) => {
  if (shouldPreventBrowserKey(e)) e.preventDefault();
  state = keyStateReducer(state, {
    type: "down",
    press: { code: e.code, key: e.key, location: e.location, repeat: e.repeat },
  });
});
```

## Tests

```bash
npm install
npm test
```

42 tests cover the state machine, layout structure and size filtering,
ChromeOS code normalization, and report formatting.

## Live demo

Try the real thing at [keyboardtestonline.com](https://keyboardtestonline.com).
The ChromeOS layout is on
[/chromebook](https://keyboardtestonline.com/chromebook). Dead-key, rollover,
latency, polling-rate, chatter, CPS, and switch tests are all there too.

## License

MIT
