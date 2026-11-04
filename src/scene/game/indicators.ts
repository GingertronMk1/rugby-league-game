import * as THREE from "three";

export function createIndicators(scene: THREE.Scene) {
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
  const kickIndicator = ring(0x9bdcf4);
  const kickArea = new THREE.Mesh(
    new THREE.CircleGeometry(4, 32),
    new THREE.MeshBasicMaterial({
      color: 0x9bdcf4,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),
  );
  kickArea.rotation.x = -Math.PI / 2;
  scene.add(kickArea);
  kickIndicator.visible = false;
  kickArea.visible = false;
  return { indicator, targetIndicator, kickIndicator, kickArea };
}
