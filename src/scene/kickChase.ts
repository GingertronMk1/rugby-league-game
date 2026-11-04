import * as THREE from "three";
import { moveTowards } from "./support";

/** Pick the onside teammate most closely aligned with the kick. */
export function selectKickChaser(
  players: THREE.Group[],
  kicker: THREE.Group,
  target: THREE.Vector3,
): THREE.Group | undefined {
  return players
    .filter(
      (player) => player !== kicker && player.position.x <= kicker.position.x,
    )
    .sort((left, right) => {
      const alignment =
        Math.abs(left.position.z - target.z) -
        Math.abs(right.position.z - target.z);
      return (
        alignment ||
        left.position.distanceToSquared(target) -
          right.position.distanceToSquared(target)
      );
    })
    .at(0);
}

/** The selected chaser tracks the ball while onside teammates advance. */
export function updateKickChase(
  players: THREE.Group[],
  kicker: THREE.Group,
  chaser: THREE.Group,
  target: THREE.Vector3,
  elapsed: number,
) {
  moveTowards(chaser, target, 14, elapsed);
  for (const player of players) {
    if (player === kicker || player === chaser) continue;
    const limit = Math.min(64, target.x - 2);
    if (player.position.x < limit)
      player.position.x = Math.min(limit, player.position.x + 10 * elapsed);
  }
}
