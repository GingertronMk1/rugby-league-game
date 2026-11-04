interface FieldPosition {
  x: number;
  z: number;
}

export function isTry(
  carrier: FieldPosition,
  defenders: readonly FieldPosition[],
) {
  const inGoal = carrier.x >= 50 && carrier.x < 66 && Math.abs(carrier.z) < 35;
  const touched = defenders.some(
    (defender) =>
      Math.hypot(defender.x - carrier.x, defender.z - carrier.z) < 2.1,
  );
  return inGoal && !touched;
}
