export type CopyPlan = { text: string; charCount: number; lineCount: number };

export function planCopy(selectedText: string): CopyPlan | null {
  if (selectedText.trim() === "") return null;
  return {
    text: selectedText,
    charCount: selectedText.length,
    lineCount: selectedText.split("\n").length,
  };
}

export function copyNotice(plan: CopyPlan, copied: boolean): string {
  if (!copied) return "Clipboard unavailable — terminal has no OSC52";
  if (plan.lineCount > 1) return `Copied ${plan.lineCount} lines`;
  return `Copied ${plan.charCount} chars`;
}
