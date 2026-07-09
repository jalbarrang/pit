import { parseAnsiLine } from "@pit/tui";

export const sanitizeMessageText = (text: string): string => {
  if (!text.includes("\x1b")) return text;
  return text.split("\n").map((line) => parseAnsiLine(line).map((chunk) => chunk.text).join("")).join("\n");
};
