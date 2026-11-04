import * as THREE from "three";
import { PlayerPosition, type Player } from "./players";

/** Advance the line and pursue a carrier who breaks through it. */
export function updateDefence(
  defenders: THREE.Group[],
  carrier: THREE.Object3D,
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

export interface RuckDefence {
  markers: THREE.Group[];
  retreatLine: number;
  markerTargets: THREE.Vector3[];
}

/** Select the closest defenders as markers and set the offside line. */
export function createRuckDefence(
  defenders: THREE.Group[],
  tackle: THREE.Vector3,
): RuckDefence {
  const markers = [...defenders]
    .sort(
      (left, right) =>
        left.position.distanceToSquared(tackle) -
        right.position.distanceToSquared(tackle),
    )
    .slice(0, 2);
  // The defending goal line is the retreat limit when it is less than 10m away.
  const retreatLine = tackle.x <= 50 ? Math.min(tackle.x + 10, 50) : 64;
  return {
    markers,
    retreatLine,
    markerTargets: markers.map(
      (_, index) =>
        new THREE.Vector3(
          Math.min(64, tackle.x + 2.3 + index * 2.4),
          0,
          tackle.z,
        ),
    ),
  };
}

/** Move markers into place and retreat everyone else to the offside line. */
export function updateRuckDefence(
  defenders: THREE.Group[],
  setup: RuckDefence,
  elapsed: number,
  speed: number,
): boolean {
  let ready = true;
  for (const defender of defenders) {
    const markerIndex = setup.markers.indexOf(defender);
    const markerTarget = setup.markerTargets.at(markerIndex);
    if (markerIndex >= 0 && markerTarget) {
      const dx = markerTarget.x - defender.position.x;
      const dz = markerTarget.z - defender.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance > 0.05) {
        const step = Math.min(distance, speed * elapsed);
        defender.position.x += (dx / distance) * step;
        defender.position.z += (dz / distance) * step;
        if (distance - step > 0.05) ready = false;
      }
    } else if (defender.position.x < setup.retreatLine) {
      defender.position.x = Math.min(
        setup.retreatLine,
        defender.position.x + speed * elapsed,
      );
      if (defender.position.x < setup.retreatLine - 0.05) ready = false;
    }
  }
  return ready;
}
