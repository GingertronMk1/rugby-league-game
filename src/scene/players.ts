import * as THREE from "three";

/** Coordinates on the pitch: x runs between the goals and y between the touchlines. */
export interface Player {
  x: number;
  y: number;
  position: string;
}

// Home attacks toward increasing x. The hooker starts in possession, with
// teammates spread across the pitch and staggered behind the ball.
export const homePlayers: Player[] = [
  { x: -19, y: -30, position: "Left wing" },
  { x: -17, y: -25, position: "Left centre" },
  { x: -15, y: -20, position: "Left second row" },
  { x: -12, y: -10, position: "Left prop" },
  { x: -5, y: 0, position: "Hooker" },
  { x: -15, y: 20, position: "Right second row" },
  { x: -17, y: 25, position: "Right centre" },
  { x: -13, y: 10, position: "Loose forward" },
  { x: -14, y: -15, position: "Stand-off" },
  { x: -10, y: -5, position: "Scrum-half" },
  { x: -11, y: 5, position: "Right prop" },
  { x: -19, y: 30, position: "Right wing" },
  { x: -16, y: 15, position: "Fullback" },
];

// Away defends toward decreasing x: twelve across and the fullback deep.
export const awayPlayers: Player[] = [
  { x: 10, y: -30, position: "Right wing" },
  { x: 10, y: -25, position: "Right centre" },
  { x: 10, y: -20, position: "Right second row" },
  { x: 10, y: -10, position: "Right prop" },
  { x: 10, y: 0, position: "Hooker" },
  { x: 10, y: 20, position: "Left second row" },
  { x: 10, y: 25, position: "Left centre" },
  { x: 10, y: 10, position: "Loose forward" },
  { x: 10, y: -15, position: "Stand-off" },
  { x: 10, y: -5, position: "Scrum-half" },
  { x: 10, y: 5, position: "Left prop" },
  { x: 10, y: 30, position: "Left wing" },
  { x: 32, y: 0, position: "Fullback" },
];

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
