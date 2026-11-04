import * as THREE from "three";
import { prepareKickoff } from "./kickoff";
import type { GameState } from "./state";

export function restartGame(g: GameState) {
  for (const { player, position } of g.startingPositions)
    player.position.copy(position);
  const receiver = prepareKickoff(g.players, g.defenders, g.ball);
  g.current = receiver;
  g.tryScored = false;
  g.hasBall = false;
  g.bounce = null;
  g.kickChaser = undefined;
  g.ruck = null;
  g.defensiveReset = null;
  g.tackleCooldown = 0;
  g.heldMovement.clear();
  g.heldPass = null;
  g.highlightedTarget = undefined;
  g.aimingKick = false;
  g.indicators.indicator.visible = true;
  g.indicators.targetIndicator.visible = false;
  g.indicators.kickIndicator.visible = false;
  g.indicators.kickArea.visible = false;
  g.indicators.indicator.position.set(
    g.current.position.x,
    0.16,
    g.current.position.z,
  );
  g.flight = {
    from: g.ball.position.clone(),
    to: new THREE.Vector3(receiver.position.x, 0.7, receiver.position.z),
    recipient: receiver,
    started: performance.now(),
    duration: 1200,
    height: 12,
  };
}
