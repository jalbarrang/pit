import type { SelectItem } from "@pit/tui";
import type { ModelRef } from "../ports.ts";

export const modelKey = (ref: ModelRef): string => `${ref.provider}/${ref.id}`;

export const modelSelectItems = (models: ModelRef[], currentKey?: string): { items: SelectItem[]; initialIndex: number } => {
  const items = models.map((ref) => {
    const key = modelKey(ref);
    return { value: key, label: key, ...(key === currentKey ? { description: "(current)" } : {}) };
  });
  const initialIndex = Math.max(0, items.findIndex((item) => item.value === currentKey));
  return { items, initialIndex };
};

export const findModel = (models: ModelRef[], key: string): ModelRef | undefined =>
  models.find((ref) => modelKey(ref) === key);
