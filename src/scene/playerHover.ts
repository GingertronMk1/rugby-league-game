import * as THREE from "three";
import type { Player } from "./players";

export function setupPlayerHover(
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  players: THREE.Group[],
  tooltip: HTMLElement,
) {
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();

  function hide() {
    tooltip.hidden = true;
    canvas.style.cursor = "";
  }

  function onPointerMove(event: PointerEvent) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit: THREE.Intersection | undefined = raycaster
      .intersectObjects(players, true)
      .at(0);
    let object: THREE.Object3D | null = hit ? hit.object : null;
    while (object && !object.userData.player) object = object.parent;
    const player = object?.userData.player as Player | undefined;
    if (!player) {
      hide();
      return;
    }

    tooltip.textContent = `${String(player.number)} · ${player.position}`;
    tooltip.hidden = false;
    canvas.style.cursor = "pointer";
    const left = Math.max(
        0,
        Math.min(
          event.clientX - bounds.left + 12,
          bounds.width - tooltip.offsetWidth - 4,
        ),
      ),
      top = Math.max(
        0,
        Math.min(
          event.clientY - bounds.top + 12,
          bounds.height - tooltip.offsetHeight - 4,
        ),
      );
    tooltip.style.left = `${String(left)}px`;
    tooltip.style.top = `${String(top)}px`;
  }

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", hide);
  return {
    hide,
    dispose() {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", hide);
      hide();
    },
  };
}
