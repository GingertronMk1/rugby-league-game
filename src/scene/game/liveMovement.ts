import { updateKickChase } from "../kickChase";
import { updateBounce } from "./ballPhysics";
import { movementDirection, moveCarrier, moveKickTarget } from "./movement";
import { placeBall } from "./actions";
import { SPEED, type GameState } from "./state";

function collect(g: GameState) {
  g.hasBall = true;
  g.kickChaser = undefined;
  g.bounce = null;
  g.indicators.indicator.visible = true;
  placeBall(g);
}
export function updateMovement(g: GameState, elapsed: number) {
  if (g.bounce && !g.aimingKick && updateBounce(g.ball, g.bounce, elapsed))
    g.bounce = null;
  if (!g.hasBall && g.kickChaser) {
    updateKickChase(
      g.players,
      g.current,
      g.kickChaser,
      g.ball.position,
      elapsed,
    );
    if (
      g.ball.position.y <= 2.2 &&
      Math.hypot(
        g.kickChaser.position.x - g.ball.position.x,
        g.kickChaser.position.z - g.ball.position.z,
      ) < 2.5
    ) {
      g.current = g.kickChaser;
      collect(g);
    }
  }
  const direction = movementDirection(g.heldMovement);
  if (direction.lengthSq() > 0 && g.aimingKick) {
    moveKickTarget(g.kickTarget, g.current, direction, SPEED * elapsed);
  } else if (direction.lengthSq() > 0) {
    moveCarrier(g.current, direction, SPEED * elapsed);
    if (g.hasBall) placeBall(g);
    else {
      g.indicators.indicator.position.set(
        g.current.position.x,
        0.16,
        g.current.position.z,
      );
      if (
        Math.hypot(
          g.current.position.x - g.ball.position.x,
          g.current.position.z - g.ball.position.z,
        ) < 2.5
      )
        collect(g);
    }
  }
}
