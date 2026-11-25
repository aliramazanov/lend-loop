export function parseChoice<const Choice extends string>(
  choices: readonly Choice[],
  value: unknown,
): Choice | undefined {
  return choices.find((choice) => choice === value);
}
