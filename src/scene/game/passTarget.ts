import type * as THREE from "three";

export type PassKey = "h" | "l";

export function selectPassTarget(
  players: THREE.Group[],
  carrier: THREE.Group,
  tackled: THREE.Group | undefined,
  inRuck: boolean,
  key: PassKey,
  longPass: boolean,
) {
  const direction = key === "h" ? -1 : 1;
  const candidates = players
    .filter(
      (player) =>
        player !== carrier &&
        player !== tackled &&
        (player.position.x < carrier.position.x ||
          (inRuck &&
            carrier.position.x <= -63.9 &&
            player.position.x <= carrier.position.x + 0.1)) &&
        (player.position.z - carrier.position.z) * direction > 0,
    )
    .sort(
      (left, right) =>
        left.position.distanceToSquared(carrier.position) -
        right.position.distanceToSquared(carrier.position),
    );
  return candidates.at(longPass && candidates.length > 1 ? 1 : 0);
}
