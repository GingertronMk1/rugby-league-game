import * as THREE from "three";

export function createField(scene: THREE.Scene) {
  function rect(
    x: number,
    z: number,
    w: number,
    h: number,
    color: number,
    y = 0,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ color, roughness: 1 }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  rect(0, 0, 154, 96, 0x243c2d);
  // Perimeter and alternating mowing stripes.
  rect(0, 0, 137, 81, 0x346e3d, 0.01);
  for (let i = 0; i < 12; i++)
    rect(-60.5 + i * 11, 0, 11, 70, i % 2 ? 0x478b4b : 0x3e8244, 0.02);
  const white = 0xe8efd5;

  function line(x: number, z: number, w: number, h: number) {
    rect(x, z, w, h, white, 0.08);
  }

  line(0, -35, 132, 0.32);
  line(0, 35, 132, 0.32);
  line(-66, 0, 0.32, 70);
  line(66, 0, 0.32, 70);
  // Try lines and ten-metre markings.
  for (let x = -50; x <= 50; x += 10) {
    line(x, 0, x === 0 ? 0.28 : 0.18, 70);
    if (x !== 0) for (const z of [-22, 0, 22]) line(x, z, 1.9, 0.2);
  }
  for (const x of [-50, 50]) line(x, 0, 0.38, 70);

  function pitchText(
    text: string,
    x: number,
    z: number,
    rotation = 0,
    size = 4,
  ) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "rgba(238,245,219,.78)";
    ctx.font = "bold 80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 64);
    const tex = new THREE.CanvasTexture(c),
      m = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 2, size),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
        }),
      );
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = rotation;
    m.position.set(x, 0.1, z);
    scene.add(m);
  }

  for (const x of [-40, -30, -20, -10, 10, 20, 30, 40]) {
    const n = String(50 - Math.abs(x));
    pitchText(n, x, -27, 0, 3);
    pitchText(n, x, 27, Math.PI, 3);
  }
  pitchText("50", 0, -27, 0, 3);
  pitchText("50", 0, 27, Math.PI, 3);
}
