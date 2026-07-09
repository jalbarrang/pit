import type { SelectItem } from "@pit/tui";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  off: "No reasoning",
  minimal: "Very brief reasoning (~1k tokens)",
  low: "Light reasoning (~2k tokens)",
  medium: "Moderate reasoning (~8k tokens)",
  high: "Deep reasoning (~16k tokens)",
  xhigh: "Maximum reasoning (~32k tokens)",
};

export const thinkingSelectItems = (available: string[], current?: string): { items: SelectItem[]; initialIndex: number } => {
  const items = available.map((level) => ({
    value: level,
    label: level,
    description: LEVEL_DESCRIPTIONS[level] ?? "Custom level",
  }));
  const initialIndex = Math.max(0, items.findIndex((item) => item.value === current));
  return { items, initialIndex };
};
