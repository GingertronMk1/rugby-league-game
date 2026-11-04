import * as THREE from "three";
import { awayPlayers, homePlayers } from "./players";
import { createPlayer } from "./playerModel";
import { setupPlayerHover } from "./playerHover";
import { createField } from "./pitch/field";
import { createGoals } from "./pitch/goals";
import { createScoreDisplay } from "./game/scoreDisplay";
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

  createField(scene);
  createGoals(scene);

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
  const score = createScoreDisplay(host);
  const passing = setupPassing(
    scene,
    home,
    away,
    ball,
    () => {
      renderer.render(scene, camera);
    },
    () => {
      score.onTry();
    },
  );
  score.onRestart(() => {
    passing.restart();
  });
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
      score.dispose();
      hover.dispose();
      passing.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
