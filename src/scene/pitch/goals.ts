import * as THREE from "three";

export function createGoals(scene: THREE.Scene) {
  // Goal posts, crossbars and pads.
  for (const x of [-50, 50]) {
    for (const z of [-3, 3]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 7, 8),
        new THREE.MeshStandardMaterial({ color: 0xf3f1df }),
      );
      post.position.set(x, 3.5, z);
      scene.add(post);
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.7, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xe8d65a }),
      );
      pad.position.set(x, 0.85, z);
      scene.add(pad);
    }
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );
    bar.rotation.x = Math.PI / 2;
    bar.position.set(x, 3, 0);
    scene.add(bar);
  }
}
