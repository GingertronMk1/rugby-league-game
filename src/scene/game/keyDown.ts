import { targetFor } from "./actions";
import type { GameState } from "./state";

function isTextInput(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}
export function keyDown(g: GameState, event: KeyboardEvent) {
  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    isTextInput(event.target)
  )
    return;
  const key = event.key.toLowerCase();
  if (g.tryScored) return;
  if (g.ruck) {
    if (
      g.ruck.ready &&
      (key === "h" || key === "l") &&
      !event.repeat &&
      !g.heldPass
    ) {
      event.preventDefault();
      g.heldPass = { key, started: performance.now() };
      g.highlightedTarget = targetFor(g, key, false);
    }
    return;
  }
  if (["w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
    g.heldMovement.add(key);
  } else if (
    key === "k" &&
    !event.repeat &&
    !g.flight &&
    g.hasBall &&
    !g.heldPass &&
    !g.aimingKick
  ) {
    event.preventDefault();
    g.aimingKick = true;
    g.heldMovement.clear();
    g.kickTarget.set(
      Math.min(g.current.position.x + 30, 64),
      0.18,
      g.current.position.z,
    );
    g.indicators.kickIndicator.visible = true;
    g.indicators.kickArea.visible = true;
  } else if (
    (key === "h" || key === "l") &&
    !event.repeat &&
    !g.heldPass &&
    !g.aimingKick &&
    g.hasBall &&
    !g.flight
  ) {
    event.preventDefault();
    g.heldPass = { key, started: performance.now() };
    g.highlightedTarget = targetFor(g, key, false);
  }
}
