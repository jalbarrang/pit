type Content = string | Array<{ type: string; text?: string; thinking?: string }>;

export const textFromContent = (content: Content | undefined): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((part) => part.type === "text").map((part) => part.text ?? "").join("");
};

export const thinkingFromContent = (content: Content | undefined): string => {
  if (!Array.isArray(content)) return "";
  return content.filter((part) => part.type === "thinking").map((part) => part.thinking ?? "").join("");
};
