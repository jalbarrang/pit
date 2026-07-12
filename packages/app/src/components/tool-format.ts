import type { ToolRun } from "../domain/index.ts";

export type ToolStatusKind = "running" | "succeeded" | "failed";

export interface ToolDisplay {
  name: string;
  args: string;
  status: ToolStatusKind;
  added?: number;
  removed?: number;
  outputLines: string[];
}

export const summarizeArgs = (args: unknown): string => {
  if (args === undefined) return "";
  const json = typeof args === "string" ? args : JSON.stringify(args);
  return json.length > 80 ? `${json.slice(0, 77)}…` : json;
};

export const previewOutput = (output: string, expanded: boolean, lines = 6): string => {
  if (expanded) return output;
  const parts = output.trimEnd().split("\n");
  const tail = parts.slice(-lines).join("\n");
  return parts.length > lines ? `… ${parts.length - lines} more lines · enter to expand\n${tail}` : tail;
};

const diffCounts = (tool: ToolRun): Pick<ToolDisplay, "added" | "removed"> => {
  if (!['edit', 'write'].includes(tool.name)) return {};
  const lines = tool.output.split("\n");
  return {
    added: lines.filter((line) => line.startsWith("+")).length,
    removed: lines.filter((line) => line.startsWith("-")).length,
  };
};

export const describeToolRun = (tool: ToolRun, expanded = false): ToolDisplay => ({
  name: tool.name,
  args: summarizeArgs(tool.args),
  status: tool.status,
  ...diffCounts(tool),
  outputLines: tool.output ? previewOutput(tool.output, expanded).split("\n") : [],
});

export const treePrefix = (index: number, total: number): "⎿" | "│" =>
  index === 0 || index === total - 1 ? "⎿" : "│";

export const formatToolRun = (tool: ToolRun, expanded = false): string => {
  const display = describeToolRun(tool, expanded);
  const status = display.status === "running"
    ? "⠸ running"
    : display.status === "failed"
      ? "✗ failed"
      : display.added || display.removed
        ? `+${display.added ?? 0} -${display.removed ?? 0}`
        : "✓";
  const header = `⚙ ${display.name}${display.args ? ` ${display.args}` : ""} ${status}`;
  const body = display.outputLines.map((line, index) => `  ${treePrefix(index, display.outputLines.length)} ${line}`);
  return [header, ...body].join("\n");
};
