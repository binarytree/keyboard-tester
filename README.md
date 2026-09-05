# keyboard-tester

**The ChromeOS-aware keyboard tester core, open for audit.** Powers
[keyboardtestonline.com](https://keyboardtestonline.com). TypeScript, zero
runtime dependencies, no server. Every keypress stays in the browser.

## Not a Windows keyboard with different labels

Search for a Chromebook keyboard tester and you mostly find Windows keyboard
layouts wearing different key caps. This core is different where it matters:

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

[keyboardtestonline.com](https://keyboardtestonline.com) runs this core. The
ChromeOS layout is on
[/chromebook](https://keyboardtestonline.com/chromebook). Dead-key, rollover,
latency, polling-rate, chatter, CPS, and switch tests are all there too.

## License

MIT
