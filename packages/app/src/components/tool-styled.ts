import { StyledText, fg, type TextChunk } from "@opentui/core";
import { ansiTextToStyledText } from "@pit/tui";
import type { ToolRun } from "../domain/index.ts";
import type { PitTheme } from "../domain/theming/index.ts";
import { describeToolRun, treePrefix } from "./tool-format.ts";

const outputChunks = (line: string, theme: PitTheme): TextChunk[] => {
  if (line.startsWith("… ") && line.includes(" · enter to expand")) {
    const [summary, tail = ""] = line.split("enter", 2);
    return [
      fg(theme.color("toolOutput"))(summary),
      fg(theme.color("expandHint"))("enter"),
      fg(theme.color("toolOutput"))(tail),
    ];
  }
  if (line.includes("\x1b")) return ansiTextToStyledText(line).chunks;
  return [fg(theme.color("toolOutput"))(line)];
};

export const buildToolText = (run: ToolRun, theme: PitTheme, expanded: boolean, includeOutput = true): StyledText => {
  const display = describeToolRun(run, expanded);
  const chunks: TextChunk[] = [
    fg(theme.color("toolGlyph"))("⚙"),
    fg(theme.color("toolTitle"))(` ${display.name}`),
  ];
  if (display.args) chunks.push(fg(theme.color("toolOutput"))(` ${display.args}`));
  if (display.status === "running") chunks.push(fg(theme.color("brand"))(" ⠸ running"));
  else if (display.status === "failed") chunks.push(fg(theme.color("error"))(" ✗ failed"));
  else if (display.added || display.removed) {
    chunks.push(fg(theme.color("success"))(` +${display.added ?? 0}`));
    chunks.push(fg(theme.color("error"))(` -${display.removed ?? 0}`));
  } else chunks.push(fg(theme.color("success"))(" ✓"));
  if (!includeOutput) return new StyledText(chunks);
  display.outputLines.forEach((line, index) => {
    chunks.push({ __isChunk: true, text: "\n  " });
    chunks.push(fg(theme.color("connector"))(treePrefix(index, display.outputLines.length)));
    chunks.push({ __isChunk: true, text: " " }, ...outputChunks(line, theme));
  });
  return new StyledText(chunks);
};
