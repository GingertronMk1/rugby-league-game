import * as THREE from "three";

/** Move the attacking line towards the carrier while keeping passing depth. */
export function updateSupport(
  players: THREE.Group[],
  carrier: THREE.Group,
  elapsed: number,
  excluded: readonly THREE.Group[] = [],
  referenceX = carrier.position.x,
) {
  players.forEach((player, index) => {
    if (player === carrier || excluded.includes(player)) return;
    const lateral = (index - 6) * 4.5;
    const depth = 6 + Math.abs(index - 6) * 0.65;
    const targetX = Math.max(-64, referenceX - depth);
    const targetZ = THREE.MathUtils.clamp(
      carrier.position.z + lateral,
      -31,
      31,
    );
    const direction = new THREE.Vector2(
      targetX - player.position.x,
      targetZ - player.position.z,
    );
    const distance = direction.length();
    if (distance < 0.05) return;
    direction.multiplyScalar(Math.min(distance, 12 * elapsed) / distance);
    player.position.x += direction.x;
    player.position.z += direction.y;
  });
}

export function moveTowards(
  player: THREE.Group,
  target: THREE.Vector3,
  speed: number,
  elapsed: number,
) {
  const direction = new THREE.Vector2(
    target.x - player.position.x,
    target.z - player.position.z,
  );
  const distance = direction.length();
  if (distance <= 0.1) return true;
  direction.multiplyScalar(Math.min(distance, speed * elapsed) / distance);
  player.position.x += direction.x;
  player.position.z += direction.y;
  return distance <= speed * elapsed + 0.1;
}
