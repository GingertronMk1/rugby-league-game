import * as THREE from "three";
import { PlayerPosition, type Player } from "../players";

export function createRuck(
  players: THREE.Group[],
  carrier: THREE.Group,
  now: number,
) {
  const hooker = players.find(
    (player) =>
      (player.userData.player as Player).position === PlayerPosition.Hooker &&
      player !== carrier,
  );
  const dummyHalf =
    hooker ??
    players
      .filter((player) => player !== carrier)
      .sort(
        (left, right) =>
          left.position.distanceToSquared(carrier.position) -
          right.position.distanceToSquared(carrier.position),
      )
      .at(0);
  if (!dummyHalf) return null;
  return {
    tackled: carrier,
    dummyHalf,
    started: now,
    ready: false,
    target: new THREE.Vector3(
      Math.max(-64, carrier.position.x - 3),
      0,
      carrier.position.z,
    ),
  };
}
