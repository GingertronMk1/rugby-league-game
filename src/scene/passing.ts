import * as THREE from "three";
import { updateRuckDefence } from "./ruckDefence";
import { placeBall } from "./game/actions";
import { keyDown } from "./game/keyDown";
import { keyUp, cancelInput } from "./game/keyUp";
import { updateRuck } from "./game/ruckUpdate";
import { updateInFlight } from "./game/flightUpdate";
import { updateLivePlay } from "./game/liveUpdate";
import { restartGame } from "./game/restart";
import { createGameState, SPEED } from "./game/state";

export function setupPassing(
  scene: THREE.Scene,
  players: THREE.Group[],
  defenders: THREE.Group[],
  ball: THREE.Mesh,
  render: () => void,
  onTry: () => void,
) {
  const game = createGameState(scene, players, defenders, ball, render, onTry);
  placeBall(game);
  let previous = performance.now();
  let animation: number;
  const onKeyDown = (event: KeyboardEvent) => {
    keyDown(game, event);
  };
  const onKeyUp = (event: KeyboardEvent) => {
    keyUp(game, event);
  };
  const onBlur = () => {
    cancelInput(game);
  };
  function update(now: number) {
    const elapsed = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (!game.tryScored) {
      if (game.defensiveReset && !game.aimingKick) {
        const complete = updateRuckDefence(
          game.defenders,
          game.defensiveReset,
          elapsed,
          SPEED,
        );
        if (!game.ruck && complete) game.defensiveReset = null;
      }
      if (game.ruck) updateRuck(game, now, elapsed);
      else if (game.flight) updateInFlight(game, now, elapsed);
      else updateLivePlay(game, now, elapsed);
    }
    game.render();
    animation = requestAnimationFrame(update);
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  animation = requestAnimationFrame(update);
  return {
    restart() {
      restartGame(game);
    },
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      cancelAnimationFrame(animation);
      for (const mesh of Object.values(game.indicators)) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    },
  };
}
