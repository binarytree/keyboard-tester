/**
 * Pure key-state machine for the main keyboard tester.
 *
 * The Svelte component holds `$state(emptyKeyState())` and dispatches
 * actions through `keyStateReducer`; window listeners, lock sync, hold
 * timers, and DOM stay in the component. Repeat handling, keyup, blur,
 * and hold-timeout-to-stuck live here and are unit-tested.
 */

export type KeyKind = "untested" | "down" | "tested" | "stuck" | "missed";

/** Held with no keyup for this long → stuck. The component owns the timer. */
export const STUCK_HOLD_MS = 8000;

export interface KeyPress {
  code: string;
  key: string;
  location: number;
  repeat: boolean;
}

export interface KeyState {
  states: Record<string, KeyKind>;
  held: Set<string>;
  last: KeyPress | null;
}

export type KeyAction =
  | { type: "down"; press: KeyPress }
  | { type: "up"; code: string }
  | { type: "holdTimeout"; code: string }
  | { type: "toggleMissed"; code: string }
  | { type: "blur" };

export function emptyKeyState(): KeyState {
  return { states: {}, held: new Set(), last: null };
}

export function keyStateReducer(state: KeyState, action: KeyAction): KeyState {
  switch (action.type) {
    case "down": {
      // Auto-repeat presses update `last` but never re-add to held.
      if (action.press.repeat) return { ...state, last: action.press };
      const held = new Set(state.held);
      held.add(action.press.code);
      return { ...state, held, last: action.press };
    }
    case "up": {
      // A later release means the key did come up — even if we had marked
      // it stuck (long hold or blur). A physically stuck switch never
      // sends keyup, so that finding stays.
      const held = new Set(state.held);
      held.delete(action.code);
      return {
        ...state,
        held,
        states: { ...state.states, [action.code]: "tested" },
      };
    }
    case "holdTimeout": {
      if (!state.held.has(action.code)) return state;
      const held = new Set(state.held);
      held.delete(action.code);
      return {
        ...state,
        held,
        states: { ...state.states, [action.code]: "stuck" },
      };
    }
    case "toggleMissed": {
      // User asserts they pressed a key that never lit. Only legal on
      // keys we have no event for (or to undo that assertion).
      if (state.held.has(action.code)) return state;
      const current = state.states[action.code];
      if (current === "tested" || current === "stuck") return state;
      const states = { ...state.states };
      if (current === "missed") delete states[action.code];
      else states[action.code] = "missed";
      return { ...state, states };
    }
    case "blur": {
      if (state.held.size === 0) return state;
      const states = { ...state.states };
      for (const code of state.held) states[code] = "stuck";
      return { ...state, states, held: new Set() };
    }
  }
}
