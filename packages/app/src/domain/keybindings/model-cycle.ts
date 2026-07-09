import type { ModelRef } from "../ports.ts";

export function nextModel(models: ModelRef[], current: ModelRef, dir: 1 | -1): ModelRef | null {
  if (models.length < 2) return null;
  const idx = models.findIndex((m) => m.provider === current.provider && m.id === current.id);
  if (idx < 0) return null;
  return models[(idx + dir + models.length) % models.length] ?? null;
}
