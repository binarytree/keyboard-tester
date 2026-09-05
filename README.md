<div align="center">

**English** | [简体中文](README.zh-CN.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md)

</div>

# keyboard-tester

Open-source keyboard tester for the browser: **ChromeOS, Windows, and Mac
layouts**, a key state machine, and copy-ready reports. TypeScript and Svelte,
zero server, no telemetry. Every keypress stays in the browser.

Powers [keyboardtestonline.com](https://keyboardtestonline.com).

## Run the demo

```bash
npm install
npm run dev
```

Open the printed URL. Press keys on your real keyboard; they light up on the
board. Switch Win / Mac / ChromeOS in the toolbar. Build a static copy with
`npm run build`, serve `dist-demo/` anywhere.

## What is in here

- `src/`, the framework-free core. Layouts (ANSI, ISO, ChromeOS), the key
  state machine, browser key-event policy, report formatting, polling-rate
  estimation. No DOM assumptions beyond `KeyboardEvent`.
- `components/`, a Svelte 5 tester component that renders the core. Drop it in
  any Svelte app; translation strings are props with English defaults.

## Not a Windows keyboard with different labels

Search for a Chromebook keyboard tester and you mostly find Windows keyboard
layouts wearing different key caps. This one is faithful to the hardware:

- Search replaces Caps Lock, exactly as on a Chromebook.
- The top row is real Chromebook action keys (Back, Refresh, Full screen,
  brightness, volume), not F1-F12 in disguise.
- `normalizeChromeosCode` maps F1-F10 back to the action codes for
  Chromebooks in function-key mode.
- No numpad, no PrtSc block, no leftover Win or Menu keys.

This is the layout a school IT check or a used-Chromebook buyer actually
needs, because the keys they worry about are the ones that look wrong on a
Windows tester.

## The privacy claim is the code

"You never upload keystrokes" is easy to say and hard to verify. Here it is
verifiable in three files:

- `src/keyState.ts`, the state machine a keypress moves through. Pure
  functions, local state only.
- `src/keyboardEvents.ts`, which browser keys the tester swallows so the page
  itself does not trigger shortcuts while you test.
- `src/keyReport.ts`, which formats a text report from key codes alone. It
  never sees what you typed, because nothing was collected.

No network call exists in this package. There is nothing to review past those
three files.

## Layouts

- ANSI and ISO boards, Windows and Mac label variants.
- The ChromeOS layout above, faithful to the hardware.
- Size collapse (full, TKL, 75%, 65%, 60%) keeps columns aligned.

## Usage without Svelte

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
npm test
```

42 tests cover the state machine, layout structure and size filtering,
ChromeOS code normalization, and report formatting.

## Live demo

[keyboardtestonline.com](https://keyboardtestonline.com) runs this core. The
ChromeOS layout is on
[/chromebook](https://keyboardtestonline.com/chromebook). Dead-key, rollover,
latency, polling-rate, chatter, CPS, and switch tests are all there too.

## License

MIT
