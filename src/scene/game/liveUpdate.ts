import { updateDefence } from "../defence";
import { updateSupport } from "../support";
import { isTry } from "../scoring";
import { startRuck, targetFor } from "./actions";
import { LONG_PRESS_MS, SPEED, type GameState } from "./state";
import { updateMovement } from "./liveMovement";

export function updateLivePlay(g: GameState, now: number, elapsed: number) {
  updateMovement(g, elapsed);
  if (!g.aimingKick && !g.defensiveReset)
    updateDefence(
      g.defenders,
      g.hasBall ? g.current : g.ball,
      elapsed,
      SPEED / 2,
    );
  if (g.hasBall && !g.aimingKick) {
    updateSupport(g.players, g.current, elapsed);
    const touching = g.defenders.some(
      (defender) =>
        Math.hypot(
          defender.position.x - g.current.position.x,
          defender.position.z - g.current.position.z,
        ) < 2.1,
    );
    if (touching && now >= g.tackleCooldown) startRuck(g, now);
    else if (
      !touching &&
      isTry(
        g.current.position,
        g.defenders.map((defender) => defender.position),
      )
    ) {
      g.tryScored = true;
      g.heldMovement.clear();
      g.heldPass = null;
      g.highlightedTarget = undefined;
      g.indicators.targetIndicator.visible = false;
      g.onTry();
    }
  }
  if (g.aimingKick) {
    g.indicators.kickIndicator.position.copy(g.kickTarget);
    g.indicators.kickArea.position.set(g.kickTarget.x, 0.15, g.kickTarget.z);
  }
  const target =
    g.heldPass &&
    targetFor(g, g.heldPass.key, now - g.heldPass.started >= LONG_PRESS_MS);
  g.highlightedTarget = target ?? undefined;
  g.indicators.targetIndicator.visible = Boolean(target);
  if (target)
    g.indicators.targetIndicator.position.set(
      target.position.x,
      0.17,
      target.position.z,
    );
}
