import * as THREE from "three";

/** Controls home possession and animates passes between home players. */
export function setupPassing(
  scene: THREE.Scene,
  players: THREE.Group[],
  ball: THREE.Mesh,
  render: () => void,
) {
  const carrier = players.at(4);
  if (!carrier) throw new Error("Home team needs a ball carrier");

  const indicator = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 1.8, 32),
    new THREE.MeshBasicMaterial({ color: 0xd4ed88, side: THREE.DoubleSide }),
  );
  indicator.rotation.x = -Math.PI / 2;
  scene.add(indicator);
  let current = carrier;
  let animation: number | null = null;

  function placeBall(player: THREE.Group) {
    ball.position.set(player.position.x + 2, 0.7, player.position.z);
    indicator.position.set(player.position.x, 0.16, player.position.z);
  }
  placeBall(current);

  function onKeyDown(event: KeyboardEvent) {
    if (
      event.repeat ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      animation !== null
    )
      return;
    const active = event.target;
    if (
      active instanceof HTMLElement &&
      (active.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))
    )
      return;
    const key = event.key.toLowerCase();
    if (key !== "h" && key !== "l") return;
    const direction = key === "h" ? -1 : 1;
    const recipient = players
      .filter(
        (player) =>
          player.position.x < current.position.x &&
          (player.position.z - current.position.z) * direction > 0,
      )
      .sort(
        (left, right) =>
          left.position.distanceToSquared(current.position) -
          right.position.distanceToSquared(current.position),
      )
      .at(0);
    if (!recipient) return;
    event.preventDefault();
    const recipientPlayer: THREE.Group = recipient;
    const start = ball.position.clone();
    const end = new THREE.Vector3(
      recipient.position.x + 2,
      0.7,
      recipient.position.z,
    );
    const started = performance.now();
    const duration = 450;
    indicator.visible = false;
    function step(now: number) {
      const progress = Math.min((now - started) / duration, 1);
      ball.position.lerpVectors(start, end, progress);
      ball.position.y += Math.sin(progress * Math.PI) * 2;
      render();
      if (progress < 1) {
        animation = requestAnimationFrame(step);
      } else {
        current = recipientPlayer;
        placeBall(current);
        indicator.visible = true;
        animation = null;
        render();
      }
    }
    animation = requestAnimationFrame(step);
  }
  window.addEventListener("keydown", onKeyDown);
  return {
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      if (animation !== null) cancelAnimationFrame(animation);
      scene.remove(indicator);
      indicator.geometry.dispose();
      indicator.material.dispose();
    },
  };
}
