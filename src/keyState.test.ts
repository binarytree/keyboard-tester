import { describe, it, expect } from "vitest";
import { emptyKeyState, keyStateReducer } from "./keyState";

const press = (code: string, repeat = false) => ({
  code,
  key: code,
  location: 0,
  repeat,
});

describe("keyStateReducer", () => {
  it("keydown holds a key and records last", () => {
    const s = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    expect(s.held.has("KeyA")).toBe(true);
    expect(s.last?.code).toBe("KeyA");
    expect(s.states["KeyA"]).toBeUndefined();
  });

  it("keyup marks the key tested", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "up", code: "KeyA" });
    expect(s.held.size).toBe(0);
    expect(s.states["KeyA"]).toBe("tested");
  });

  it("repeat keydown updates last without re-adding to held", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "down", press: press("KeyA", true) });
    expect(s.held.size).toBe(1);
    expect(s.last?.repeat).toBe(true);
  });

  it("blur marks all held keys stuck and clears held", () => {
    let s = emptyKeyState();
    s = keyStateReducer(s, { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "down", press: press("KeyB") });
    s = keyStateReducer(s, { type: "blur" });
    expect(s.states["KeyA"]).toBe("stuck");
    expect(s.states["KeyB"]).toBe("stuck");
    expect(s.held.size).toBe(0);
  });

  it("blur with nothing held is a no-op", () => {
    const s = keyStateReducer(emptyKeyState(), { type: "blur" });
    expect(s.held.size).toBe(0);
    expect(Object.keys(s.states)).toHaveLength(0);
  });

  it("holdTimeout marks a still-held key stuck and drops it from held", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "holdTimeout", code: "KeyA" });
    expect(s.states["KeyA"]).toBe("stuck");
    expect(s.held.has("KeyA")).toBe(false);
  });

  it("holdTimeout is a no-op when the key is no longer held", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "up", code: "KeyA" });
    s = keyStateReducer(s, { type: "holdTimeout", code: "KeyA" });
    expect(s.states["KeyA"]).toBe("tested");
    expect(s.held.size).toBe(0);
  });

  it("keyup after stuck marks the key tested", () => {
    let s = emptyKeyState();
    s = keyStateReducer(s, { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "blur" });
    s = keyStateReducer(s, { type: "up", code: "KeyA" });
    expect(s.states["KeyA"]).toBe("tested");
  });

  it("toggleMissed flags an untested key and undoes", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "toggleMissed", code: "KeyF" });
    expect(s.states["KeyF"]).toBe("missed");
    s = keyStateReducer(s, { type: "toggleMissed", code: "KeyF" });
    expect(s.states["KeyF"]).toBeUndefined();
  });

  it("toggleMissed ignores held, tested, and stuck keys", () => {
    let held = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyA") });
    held = keyStateReducer(held, { type: "toggleMissed", code: "KeyA" });
    expect(held.states["KeyA"]).toBeUndefined();
    expect(held.held.has("KeyA")).toBe(true);

    let tested = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyB") });
    tested = keyStateReducer(tested, { type: "up", code: "KeyB" });
    tested = keyStateReducer(tested, { type: "toggleMissed", code: "KeyB" });
    expect(tested.states["KeyB"]).toBe("tested");

    let stuck = keyStateReducer(emptyKeyState(), { type: "down", press: press("KeyC") });
    stuck = keyStateReducer(stuck, { type: "blur" });
    stuck = keyStateReducer(stuck, { type: "toggleMissed", code: "KeyC" });
    expect(stuck.states["KeyC"]).toBe("stuck");
  });

  it("keyup after missed marks the key tested", () => {
    let s = keyStateReducer(emptyKeyState(), { type: "toggleMissed", code: "KeyA" });
    s = keyStateReducer(s, { type: "down", press: press("KeyA") });
    s = keyStateReducer(s, { type: "up", code: "KeyA" });
    expect(s.states["KeyA"]).toBe("tested");
  });
});
