import { treePrefix } from "./tool-format.ts";

export const formatBashHeader = (command: string, excluded: boolean): string =>
  `⚙ bash ${command}${excluded ? "  (excluded)" : ""}`;

export const bashOutputLines = (output: string, expanded: boolean, lines = 20): string[] => {
  if (!output) return [];
  const parts = output.trimEnd().split("\n");
  if (expanded || parts.length <= lines) return parts;
  return [`… ${parts.length - lines} more lines · ctrl+o to expand`, ...parts.slice(-lines)];
};

export const formatBashOutput = (output: string, expanded: boolean, lines = 20): string => {
  const parts = bashOutputLines(output, expanded, lines);
  return parts.map((line, index) => `  ${treePrefix(index, parts.length)} ${line}`).join("\n");
};

export const formatBashStatus = (exitCode: number | null | undefined, cancelled: boolean): string => {
  if (cancelled) return "✗ cancelled";
  if (exitCode === undefined || exitCode === null) return "";
  return exitCode === 0 ? "✓ exit 0" : `✗ exit ${exitCode}`;
};
