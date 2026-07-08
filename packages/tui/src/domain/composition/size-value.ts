export type SizeValue = number | `${number}%`;

export function parseSizeValue(value: SizeValue | undefined, referenceSize: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Math.floor((referenceSize * Number.parseFloat(match[1]!)) / 100) : undefined;
}
