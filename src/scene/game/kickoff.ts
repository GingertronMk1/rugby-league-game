import * as THREE from "three";
import { PlayerPosition, type Player } from "../players";

export function prepareKickoff(
  players: THREE.Group[],
  defenders: THREE.Group[],
  ball: THREE.Mesh,
) {
  const receivingPositions: Record<PlayerPosition, [number, number]> = {
    [PlayerPosition.Fullback]: [-30, 0],
    [PlayerPosition.LeftWing]: [-34, -24],
    [PlayerPosition.RightWing]: [-34, 24],
    [PlayerPosition.LeftCentre]: [-25, -23],
    [PlayerPosition.RightCentre]: [-25, 23],
    [PlayerPosition.StandOff]: [-22, -12],
    [PlayerPosition.ScrumHalf]: [-22, 12],
    [PlayerPosition.LeftProp]: [-14, -18],
    [PlayerPosition.RightProp]: [-14, 18],
    [PlayerPosition.Hooker]: [-13, 0],
    [PlayerPosition.LeftSecondRow]: [-14, -9],
    [PlayerPosition.RightSecondRow]: [-14, 9],
    [PlayerPosition.LooseForward]: [-19, 0],
  };
  for (const player of players) {
    const position = (player.userData.player as Player).position;
    const [x, z] = receivingPositions[position];
    player.position.set(x, 0, z);
  }
  const receiver = players.find(
    (player) =>
      (player.userData.player as Player).position === PlayerPosition.Fullback,
  );
  if (!receiver) throw new Error("Home kickoff receiver not found");
  const kicker = defenders.find(
    (player) =>
      (player.userData.player as Player).position === PlayerPosition.StandOff,
  );
  if (!kicker) throw new Error("Away kickoff taker not found");
  kicker.position.set(0, 0, 0);
  ball.position.set(0, 0.7, 0);
  return receiver;
}
