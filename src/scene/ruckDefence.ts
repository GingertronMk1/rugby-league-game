import * as THREE from "three";

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
