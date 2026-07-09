import type { SelectItem } from "@pit/tui";

export interface TrustChoice { value: string; label: string; trusted: boolean; description: string }

export const trustChoices = (): TrustChoice[] => [
  { value: "trust", label: "Trust this project", trusted: true, description: "Allow project-local resources for this cwd" },
  { value: "untrust", label: "Do not trust", trusted: false, description: "Run without project-local resources" },
];

export const trustItems = (): SelectItem[] => trustChoices().map(({ value, label, description }) => ({ value, label, description }));
export const findTrustChoice = (value: string): TrustChoice | undefined => trustChoices().find((choice) => choice.value === value);
