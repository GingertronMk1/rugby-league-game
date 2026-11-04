import * as THREE from "three";
import type { Player } from "./players";

export function createPlayer(
  player: Player,
  color: number,
  angle: number,
): THREE.Group {
  const group = new THREE.Group(),
    body = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1.15, 1.1, 12),
      new THREE.MeshStandardMaterial({ color }),
    );
  body.position.y = 1.05;
  group.add(body);

  const numberCanvas = document.createElement("canvas");
  numberCanvas.width = 128;
  numberCanvas.height = 128;
  const context = numberCanvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");
  context.fillStyle = color === 0xe9e5d4 ? "#17251b" : "#ffffff";
  context.font = "bold 80px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(player.number), 64, 64);
  const numberTexture = new THREE.CanvasTexture(numberCanvas);
  numberTexture.colorSpace = THREE.SRGBColorSpace;
  const number = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 1.35),
    new THREE.MeshBasicMaterial({
      map: numberTexture,
      transparent: true,
      depthWrite: false,
    }),
  );
  number.rotation.x = -Math.PI / 2;
  number.position.set(-0.3, 1.62, 0);
  group.add(number);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9ab83 }),
  );
  head.position.set(0.35, 1.9, 0);
  group.add(head);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 16),
    new THREE.MeshBasicMaterial({
      color: 0x163822,
      transparent: true,
      opacity: 0.3,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.4, 0.12, 0.45);
  group.add(shadow);
  // The pitch's y coordinate maps to Three.js's z axis; its y axis is height.
  group.position.set(player.x, 0, player.y);
  group.rotation.y = angle;
  group.userData.player = player;
  return group;
}
