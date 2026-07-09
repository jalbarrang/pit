import type { ToolRun } from "../domain/index.ts";

export const summarizeArgs = (args: unknown): string => {
  if (args === undefined) return "";
  const json = typeof args === "string" ? args : JSON.stringify(args);
  return json.length > 80 ? `${json.slice(0, 77)}…` : json;
};

export const previewOutput = (output: string, expanded: boolean, lines = 6): string => {
  if (expanded) return output;
  const parts = output.trimEnd().split("\n");
  const tail = parts.slice(-lines).join("\n");
  return parts.length > lines ? `… ${parts.length - lines} more lines\n${tail}` : tail;
};

export const formatToolRun = (tool: ToolRun, expanded = false): string => {
  const icon = tool.status === "running" ? "…" : tool.status === "succeeded" ? "✓" : "✗";
  const body = previewOutput(tool.output, expanded);
  const args = summarizeArgs(tool.args);
  return [`${icon} ${tool.name}${args ? ` ${args}` : ""}`, body].filter(Boolean).join("\n");
};
