import { updateKickChase } from "../kickChase";
import { updateDefence } from "../defence";
import { beginBounce, updateFlight } from "./ballPhysics";
import { placeBall } from "./actions";
import { SPEED, type GameState } from "./state";

export function updateInFlight(g: GameState, now: number, elapsed: number) {
  const flight = g.flight;
  if (!flight) return;
  if (g.kickChaser && !flight.recipient)
    updateKickChase(g.players, g.current, g.kickChaser, flight.to, elapsed);
  if (!g.defensiveReset)
    updateDefence(g.defenders, flight.recipient ?? g.ball, elapsed, SPEED / 2);
  if (!updateFlight(g.ball, flight, now)) return;
  if (!flight.recipient) g.bounce = beginBounce(flight);
  g.flight = null;
  if (flight.recipient) {
    g.current = flight.recipient;
    g.hasBall = true;
    g.indicators.indicator.visible = true;
    placeBall(g);
  }
}
