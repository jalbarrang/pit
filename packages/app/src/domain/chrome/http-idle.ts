/**
 * HTTP idle timeout choices mirroring pi's HTTP_IDLE_TIMEOUT_CHOICES
 * (not exported from the pi package root, so duplicated here).
 */
export const HTTP_IDLE_CHOICES: ReadonlyArray<{ label: string; timeoutMs: number }> = [
  { label: "30 sec", timeoutMs: 30_000 },
  { label: "1 min", timeoutMs: 60_000 },
  { label: "2 min", timeoutMs: 120_000 },
  { label: "5 min", timeoutMs: 300_000 },
  { label: "disabled", timeoutMs: 0 },
];

export const httpIdleLabels = (): string[] => HTTP_IDLE_CHOICES.map((c) => c.label);

export const formatHttpIdle = (timeoutMs: number): string =>
  HTTP_IDLE_CHOICES.find((c) => c.timeoutMs === timeoutMs)?.label ?? `${Math.round(timeoutMs / 1000)} sec`;

export const parseHttpIdle = (label: string): number | undefined =>
  HTTP_IDLE_CHOICES.find((c) => c.label === label)?.timeoutMs;
