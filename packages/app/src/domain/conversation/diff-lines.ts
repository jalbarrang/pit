export type DiffLineKind = "added" | "removed" | "context" | "hunk";
export interface ClassifiedDiffLine { kind: DiffLineKind; text: string }

const numbered = /^[+\- ]\s*\d*\s/;

export function classifyDiffLines(diffText: string): ClassifiedDiffLine[] {
  return diffText.split("\n").filter((line) => line.length > 0).map((line) => {
    const text = line.replace(/\t/g, "   ");
    if (text.startsWith("@@")) return { kind: "hunk", text };
    if (text.startsWith("+")) return { kind: "added", text };
    if (text.startsWith("-")) return { kind: "removed", text };
    return { kind: "context", text };
  });
}

export function isDiffText(text: string): boolean {
  const lines = text.split("\n");
  return lines.some((line) => line.startsWith("@@")) || lines.some((line) => numbered.test(line));
}
