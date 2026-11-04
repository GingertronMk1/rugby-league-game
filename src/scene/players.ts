import * as THREE from "three";

export enum PlayerPosition {
  Fullback = "Fullback",
  RightWing = "Right wing",
  RightCentre = "Right centre",
  LeftCentre = "Left centre",
  LeftWing = "Left wing",
  StandOff = "Stand-off",
  ScrumHalf = "Scrum-half",
  LeftProp = "Left prop",
  Hooker = "Hooker",
  RightProp = "Right prop",
  LeftSecondRow = "Left second row",
  RightSecondRow = "Right second row",
  LooseForward = "Loose forward",
}

/** Coordinates on the pitch: x runs between the goals and y between the touchlines. */
export interface Player {
  x: number;
  y: number;
  position: PlayerPosition;
  number: number;
}

// Home attacks toward increasing x. The hooker starts in possession, with
// teammates spread across the pitch and staggered behind the ball.
export const homePlayers: Player[] = [
  { x: -19, y: -30, position: PlayerPosition.LeftWing, number: 5 },
  { x: -17, y: -25, position: PlayerPosition.LeftCentre, number: 4 },
  { x: -15, y: -20, position: PlayerPosition.LeftSecondRow, number: 11 },
  { x: -12, y: -10, position: PlayerPosition.LeftProp, number: 8 },
  { x: -5, y: 0, position: PlayerPosition.Hooker, number: 9 },
  { x: -15, y: 20, position: PlayerPosition.RightSecondRow, number: 12 },
  { x: -17, y: 25, position: PlayerPosition.RightCentre, number: 3 },
  { x: -13, y: 10, position: PlayerPosition.LooseForward, number: 13 },
  { x: -14, y: -15, position: PlayerPosition.StandOff, number: 6 },
  { x: -10, y: -5, position: PlayerPosition.ScrumHalf, number: 7 },
  { x: -11, y: 5, position: PlayerPosition.RightProp, number: 10 },
  { x: -19, y: 30, position: PlayerPosition.RightWing, number: 2 },
  { x: -16, y: 15, position: PlayerPosition.Fullback, number: 1 },
];

// Away defends toward decreasing x: twelve across and the fullback deep.
export const awayPlayers: Player[] = [
  { x: 10, y: -30, position: PlayerPosition.RightWing, number: 2 },
  { x: 10, y: -25, position: PlayerPosition.RightCentre, number: 3 },
  { x: 10, y: -20, position: PlayerPosition.RightSecondRow, number: 12 },
  { x: 10, y: -10, position: PlayerPosition.RightProp, number: 10 },
  { x: 10, y: 0, position: PlayerPosition.Hooker, number: 9 },
  { x: 10, y: 20, position: PlayerPosition.LeftSecondRow, number: 11 },
  { x: 10, y: 25, position: PlayerPosition.LeftCentre, number: 4 },
  { x: 10, y: 10, position: PlayerPosition.LooseForward, number: 13 },
  { x: 10, y: -15, position: PlayerPosition.StandOff, number: 6 },
  { x: 10, y: -5, position: PlayerPosition.ScrumHalf, number: 7 },
  { x: 10, y: 5, position: PlayerPosition.LeftProp, number: 8 },
  { x: 10, y: 30, position: PlayerPosition.LeftWing, number: 5 },
  { x: 32, y: 0, position: PlayerPosition.Fullback, number: 1 },
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
