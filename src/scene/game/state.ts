import * as THREE from "three";
import { createIndicators } from "./indicators";
import type { Flight, Bounce } from "./ballPhysics";
import type { PassKey } from "./passTarget";
import type { createRuck } from "./ruck";
import type { RuckDefence } from "../ruckDefence";

export type Ruck = NonNullable<ReturnType<typeof createRuck>>;
export type Indicators = ReturnType<typeof createIndicators>;
export interface GameState {
  scene: THREE.Scene;
  players: THREE.Group[];
  defenders: THREE.Group[];
  ball: THREE.Mesh;
  render: () => void;
  onTry: () => void;
  carrier: THREE.Group;
  current: THREE.Group;
  indicators: Indicators;
  startingPositions: { player: THREE.Group; position: THREE.Vector3 }[];
  kickTarget: THREE.Vector3;
  tryScored: boolean;
  ruck: Ruck | null;
  defensiveReset: RuckDefence | null;
  tackleCooldown: number;
  aimingKick: boolean;
  hasBall: boolean;
  flight: Flight | null;
  bounce: Bounce | null;
  kickChaser: THREE.Group | undefined;
  heldPass: { key: PassKey; started: number } | null;
  highlightedTarget: THREE.Group | undefined;
  heldMovement: Set<string>;
}
export const SPEED = 18;
export const LONG_PRESS_MS = 450;

export function createGameState(
  scene: THREE.Scene,
  players: THREE.Group[],
  defenders: THREE.Group[],
  ball: THREE.Mesh,
  render: () => void,
  onTry: () => void,
): GameState {
  const carrier = players.at(4);
  if (!carrier) throw new Error("Home team needs a ball carrier");
  return {
    scene,
    players,
    defenders,
    ball,
    render,
    onTry,
    carrier,
    current: carrier,
    indicators: createIndicators(scene),
    startingPositions: [...players, ...defenders].map((player) => ({
      player,
      position: player.position.clone(),
    })),
    kickTarget: new THREE.Vector3(),
    tryScored: false,
    ruck: null,
    defensiveReset: null,
    tackleCooldown: 0,
    aimingKick: false,
    hasBall: true,
    flight: null,
    bounce: null,
    kickChaser: undefined,
    heldPass: null,
    highlightedTarget: undefined,
    heldMovement: new Set<string>(),
  };
}
