import * as THREE from "three";
import { PlayerPosition, type Player } from "./players";

/** Advance the line and pursue a carrier who breaks through it. */
export function updateDefence(
  defenders: THREE.Group[],
  carrier: THREE.Group,
  elapsed: number,
  speed: number,
) {
  for (const defender of defenders) {
    const player = defender.userData.player as Player;
    const ahead = defender.position.x - carrier.position.x;
    const lateral = carrier.position.z - defender.position.z;
    const distance = Math.hypot(ahead, lateral);
    const fullback = player.position === PlayerPosition.Fullback;

    // Hold the last line of defence until the attack gets close.
    if (fullback && distance > 30 && ahead > 0) continue;

    if (fullback || ahead <= 2.5) {
      // Chase in either direction after a break, stopping at tackle distance.
      if (distance <= 1.8) continue;
      const step = Math.min(speed * elapsed, distance - 1.8);
      defender.position.x += (-ahead / distance) * step;
      defender.position.z += (lateral / distance) * step;
    } else {
      const direction = new THREE.Vector2(
        -1,
        Math.abs(lateral) <= 14 && ahead <= 25
          ? THREE.MathUtils.clamp(lateral / 12, -1, 1)
          : 0,
      ).normalize();
      const step = Math.min(speed * elapsed, (ahead - 1.8) / -direction.x);
      defender.position.x += direction.x * step;
      defender.position.z += direction.y * step;
    }
    defender.position.x = THREE.MathUtils.clamp(defender.position.x, -64, 64);
    defender.position.z = THREE.MathUtils.clamp(defender.position.z, -33, 33);
  }
}
