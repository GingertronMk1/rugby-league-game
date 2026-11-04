import * as THREE from "three";
import { awayPlayers, createPlayer, homePlayers } from "./players";
import { setupPlayerHover } from "./playerHover";
import { setupPassing } from "./passing";

export function createPitchScene(host: HTMLElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x18251e);
  const camera = new THREE.OrthographicCamera(-80, 80, 50, -50, 0.1, 300);
  camera.position.set(0, 120, 0);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x78916d, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.3);
  sun.position.set(-30, 80, 25);
  scene.add(sun);

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

  const home = homePlayers.map((player) => createPlayer(player, 0xb84032, 0));
  const away = awayPlayers.map((player) =>
    createPlayer(player, 0xe9e5d4, Math.PI),
  );
  const players = [...home, ...away];
  scene.add(...players);
  const tooltip = host.querySelector<HTMLElement>("#player-tooltip");
  if (!tooltip) throw new Error("Player tooltip not found");
  const hover = setupPlayerHover(renderer.domElement, camera, players, tooltip),
    ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5f1da }),
    );
  ball.scale.set(1.5, 0.7, 1);
  scene.add(ball);
  const overlay = host.querySelector<HTMLElement>("#try-overlay");
  const restartButton = host.querySelector<HTMLButtonElement>("#restart-play");
  const scoreDisplay = document.querySelector<HTMLElement>("#home-score");
  if (!overlay || !restartButton || !scoreDisplay)
    throw new Error("Score controls not found");
  let homeScore = 0;
  const passing = setupPassing(
    scene,
    home,
    away,
    ball,
    () => {
      renderer.render(scene, camera);
    },
    () => {
      homeScore += 4;
      scoreDisplay.textContent = String(homeScore);
      overlay.hidden = false;
      restartButton.focus();
    },
  );
  const restartPlay = () => {
    passing.restart();
    overlay.hidden = true;
    restartButton.blur();
  };
  restartButton.addEventListener("click", restartPlay);
  let zoom = 1;

  function resize() {
    hover.hide();
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h);
    const aspect = w / h,
      half = Math.max(50, 80 / aspect) / zoom;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);

  return {
    zoomIn() {
      zoom = Math.min(1.7, zoom + 0.2);
      resize();
    },
    zoomOut() {
      zoom = Math.max(0.8, zoom - 0.2);
      resize();
    },
    reset() {
      zoom = 1;
      resize();
    },
    dispose() {
      observer.disconnect();
      restartButton.removeEventListener("click", restartPlay);
      hover.dispose();
      passing.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
