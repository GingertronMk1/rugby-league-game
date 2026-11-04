import { moveTowards, updateSupport } from "../support";
import { placeBall, targetFor } from "./actions";
import { LONG_PRESS_MS, type GameState } from "./state";

export function updateRuck(g: GameState, now: number, elapsed: number) {
  const ruck = g.ruck;
  if (!ruck) return;
  const { tackled, dummyHalf, target, started } = ruck;
  const arrived = moveTowards(dummyHalf, target, 22, elapsed);
  updateSupport(g.players, tackled, elapsed, [dummyHalf], target.x);
  if (arrived && now - started >= 700 && !ruck.ready) {
    g.current = dummyHalf;
    placeBall(g);
    g.indicators.indicator.visible = true;
    ruck.ready = true;
  }
  const player =
    ruck.ready && g.heldPass
      ? targetFor(g, g.heldPass.key, now - g.heldPass.started >= LONG_PRESS_MS)
      : undefined;
  g.highlightedTarget = player;
  g.indicators.targetIndicator.visible = Boolean(player);
  if (player)
    g.indicators.targetIndicator.position.set(
      player.position.x,
      0.17,
      player.position.z,
    );
}
