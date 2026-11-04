import * as THREE from "three";

export function movementDirection(keys: Set<string>) {
  const dx = Number(keys.has("d")) - Number(keys.has("a"));
  const dz = Number(keys.has("s")) - Number(keys.has("w"));
  const length = Math.hypot(dx, dz);
  return length
    ? new THREE.Vector2(dx / length, dz / length)
    : new THREE.Vector2();
}

export function moveCarrier(
  carrier: THREE.Group,
  direction: THREE.Vector2,
  distance: number,
) {
  carrier.position.x = THREE.MathUtils.clamp(
    carrier.position.x + direction.x * distance,
    -64,
    64,
  );
  carrier.position.z = THREE.MathUtils.clamp(
    carrier.position.z + direction.y * distance,
    -33,
    33,
  );
}

export function moveKickTarget(
  target: THREE.Vector3,
  carrier: THREE.Group,
  direction: THREE.Vector2,
  distance: number,
) {
  target.x = THREE.MathUtils.clamp(
    target.x + direction.x * distance,
    Math.min(carrier.position.x + 3, 64),
    64,
  );
  target.z = THREE.MathUtils.clamp(target.z + direction.y * distance, -33, 33);
  const offset = new THREE.Vector2(
    target.x - carrier.position.x,
    target.z - carrier.position.z,
  );
  if (offset.length() > 50) {
    offset.setLength(50);
    target.x = carrier.position.x + offset.x;
    target.z = carrier.position.z + offset.y;
  }
}
