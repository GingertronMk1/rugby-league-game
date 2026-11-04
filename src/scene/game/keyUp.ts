import * as THREE from "three";
import { selectKickChaser } from "../kickChase";
import { startPass } from "./actions";
import type { GameState } from "./state";

export function keyUp(g: GameState, event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  g.heldMovement.delete(key);
  if (g.tryScored || (g.ruck && !g.ruck.ready)) return;
  if (key === "k" && g.aimingKick) {
    g.aimingKick = false;
    g.heldMovement.clear();
    g.indicators.kickIndicator.visible = false;
    g.indicators.kickArea.visible = false;
    g.indicators.indicator.visible = false;
    g.hasBall = false;
    g.kickChaser = selectKickChaser(g.players, g.current, g.kickTarget);
    g.flight = {
      from: g.ball.position.clone(),
      to: new THREE.Vector3(g.kickTarget.x, 0.7, g.kickTarget.z),
      recipient: null,
      started: performance.now(),
      duration: 1200,
      height: 12,
    };
    return;
  }
  if (g.heldPass?.key !== key) return;
  const now = performance.now();
  const recipient = g.highlightedTarget;
  g.heldPass = null;
  g.highlightedTarget = undefined;
  g.indicators.targetIndicator.visible = false;
  if (recipient && !g.flight) {
    if (g.ruck) {
      g.ruck = null;
      g.tackleCooldown = now + 900;
    }
    startPass(g, recipient, now);
  }
}
export function cancelInput(g: GameState) {
  g.heldMovement.clear();
  g.heldPass = null;
  g.highlightedTarget = undefined;
  g.aimingKick = false;
  g.indicators.targetIndicator.visible = false;
  g.indicators.kickIndicator.visible = false;
  g.indicators.kickArea.visible = false;
}
