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
