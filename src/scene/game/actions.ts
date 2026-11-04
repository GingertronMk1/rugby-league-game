import * as THREE from "three";
import { selectPassTarget, type PassKey } from "./passTarget";
import { createRuck } from "./ruck";
import { createRuckDefence } from "../ruckDefence";
import type { GameState } from "./state";

export function placeBall(g: GameState) {
  g.ball.position.set(g.current.position.x + 2, 0.7, g.current.position.z);
  g.indicators.indicator.position.set(
    g.current.position.x,
    0.16,
    g.current.position.z,
  );
}
export function targetFor(g: GameState, key: PassKey, longPass: boolean) {
  return selectPassTarget(
    g.players,
    g.current,
    g.ruck?.tackled,
    g.ruck !== null,
    key,
    longPass,
  );
}
export function startPass(g: GameState, recipient: THREE.Group, now: number) {
  g.flight = {
    from: g.ball.position.clone(),
    to: new THREE.Vector3(recipient.position.x + 2, 0.7, recipient.position.z),
    recipient,
    started: now,
    duration: 450,
    height: 2,
  };
  g.indicators.indicator.visible = false;
  g.indicators.targetIndicator.visible = false;
}
export function startRuck(g: GameState, now: number) {
  const next = createRuck(g.players, g.current, now);
  if (!next) return;
  g.defensiveReset = createRuckDefence(g.defenders, g.current.position);
  g.ruck = next;
  g.heldMovement.clear();
  g.heldPass = null;
  g.highlightedTarget = undefined;
  g.aimingKick = false;
  g.indicators.targetIndicator.visible = false;
  g.indicators.kickIndicator.visible = false;
  g.indicators.kickArea.visible = false;
  g.indicators.indicator.visible = false;
  g.ball.position.set(g.current.position.x - 1.5, 0.7, g.current.position.z);
}
