type ToolResult = { content?: Array<{ type: string; text?: string }>; details?: unknown };

export const toolOutputText = (result: ToolResult | undefined): string => {
  const text = result?.content?.filter((part) => part.type === "text").map((part) => part.text ?? "").join("\n") ?? "";
  if (text) return text;
  if (result?.details === undefined) return "";
  return typeof result.details === "string" ? result.details : JSON.stringify(result.details, null, 2);
};
