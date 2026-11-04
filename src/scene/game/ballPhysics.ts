import * as THREE from "three";

export interface Flight {
  from: THREE.Vector3;
  to: THREE.Vector3;
  recipient: THREE.Group | null;
  started: number;
  duration: number;
  height: number;
}

export interface Bounce {
  velocity: THREE.Vector3;
}

export function updateFlight(ball: THREE.Mesh, flight: Flight, now: number) {
  const progress = Math.min((now - flight.started) / flight.duration, 1);
  ball.position.lerpVectors(flight.from, flight.to, progress);
  ball.position.y += Math.sin(progress * Math.PI) * flight.height;
  return progress === 1;
}

export function beginBounce(flight: Flight): Bounce {
  const direction = flight.to.clone().sub(flight.from).setY(0).normalize();
  return { velocity: direction.multiplyScalar(5).setY(6) };
}

export function updateBounce(
  ball: THREE.Mesh,
  bounce: Bounce,
  elapsed: number,
) {
  bounce.velocity.y -= 20 * elapsed;
  ball.position.addScaledVector(bounce.velocity, elapsed);
  let settled = false;
  if (ball.position.y <= 0.7) {
    ball.position.y = 0.7;
    bounce.velocity.y = Math.abs(bounce.velocity.y) * 0.45;
    bounce.velocity.x *= 0.6;
    bounce.velocity.z *= 0.6;
    settled = bounce.velocity.y < 1;
  }
  ball.position.x = THREE.MathUtils.clamp(ball.position.x, -64, 64);
  ball.position.z = THREE.MathUtils.clamp(ball.position.z, -33, 33);
  return settled;
}
