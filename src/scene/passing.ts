import * as THREE from "three";

type PassKey = "h" | "l";
interface Flight {
  from: THREE.Vector3;
  to: THREE.Vector3;
  recipient: THREE.Group;
  started: number;
}

/** Controls home possession, movement and passing. */
export function setupPassing(
  scene: THREE.Scene,
  players: THREE.Group[],
  ball: THREE.Mesh,
  render: () => void,
) {
  const carrier = players.at(4);
  if (!carrier) throw new Error("Home team needs a ball carrier");

  function ring(color: number) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 1.8, 32),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    return mesh;
  }
  const indicator = ring(0xd4ed88);
  const targetIndicator = ring(0xf9b75e);
  targetIndicator.visible = false;
  let current: THREE.Group = carrier;
  let flight: Flight | null = null;
  let heldPass: { key: PassKey; started: number } | null = null;
  const heldMovement = new Set<string>();
  const longPressMs = 450;
  const speed = 18;
  let previous = performance.now();
  let animation: number;

  function placeBall() {
    ball.position.set(current.position.x + 2, 0.7, current.position.z);
    indicator.position.set(current.position.x, 0.16, current.position.z);
  }
  placeBall();

  function targetFor(key: PassKey, longPass: boolean) {
    const direction = key === "h" ? -1 : 1;
    const candidates = players
      .filter(
        (player) =>
          player.position.x < current.position.x &&
          (player.position.z - current.position.z) * direction > 0,
      )
      .sort(
        (left, right) =>
          left.position.distanceToSquared(current.position) -
          right.position.distanceToSquared(current.position),
      );
    return candidates.at(longPass && candidates.length > 1 ? 1 : 0);
  }

  function startPass(recipient: THREE.Group, now: number) {
    flight = {
      from: ball.position.clone(),
      to: new THREE.Vector3(
        recipient.position.x + 2,
        0.7,
        recipient.position.z,
      ),
      recipient,
      started: now,
    };
    indicator.visible = false;
    targetIndicator.visible = false;
  }

  function isTextInput(target: EventTarget | null) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    );
  }

  function onKeyDown(event: KeyboardEvent) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      isTextInput(event.target)
    )
      return;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      heldMovement.add(key);
    } else if (
      (key === "h" || key === "l") &&
      !event.repeat &&
      !heldPass &&
      !flight
    ) {
      event.preventDefault();
      heldPass = { key, started: performance.now() };
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    heldMovement.delete(key);
    if (heldPass?.key !== key) return;
    const now = performance.now();
    const recipient = targetFor(
      heldPass.key,
      now - heldPass.started >= longPressMs,
    );
    heldPass = null;
    targetIndicator.visible = false;
    if (recipient && !flight) startPass(recipient, now);
  }

  function onBlur() {
    heldMovement.clear();
    heldPass = null;
    targetIndicator.visible = false;
  }

  function update(now: number) {
    const elapsed = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (flight) {
      const progress = Math.min((now - flight.started) / 450, 1);
      ball.position.lerpVectors(flight.from, flight.to, progress);
      ball.position.y += Math.sin(progress * Math.PI) * 2;
      if (progress === 1) {
        current = flight.recipient;
        flight = null;
        indicator.visible = true;
        placeBall();
      }
    } else {
      const dx = Number(heldMovement.has("d")) - Number(heldMovement.has("a"));
      const dz = Number(heldMovement.has("s")) - Number(heldMovement.has("w"));
      const length = Math.hypot(dx, dz);
      if (length > 0) {
        current.position.x = THREE.MathUtils.clamp(
          current.position.x + (dx / length) * speed * elapsed,
          -64,
          64,
        );
        current.position.z = THREE.MathUtils.clamp(
          current.position.z + (dz / length) * speed * elapsed,
          -33,
          33,
        );
        placeBall();
      }
      const target =
        heldPass &&
        targetFor(heldPass.key, now - heldPass.started >= longPressMs);
      targetIndicator.visible = Boolean(target);
      if (target)
        targetIndicator.position.set(
          target.position.x,
          0.17,
          target.position.z,
        );
    }
    render();
    animation = requestAnimationFrame(update);
  }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  animation = requestAnimationFrame(update);
  return {
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      cancelAnimationFrame(animation);
      for (const mesh of [indicator, targetIndicator]) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    },
  };
}
