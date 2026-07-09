import { extractImages, type ImagePart } from "../domain/index.ts";

export const textFromContent = (content: any): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((part) => part.type === "text").map((part) => part.text ?? "").join("");
};

export const textFromResult = (result: any): string => {
  if (typeof result?.details?.diff === "string") return result.details.diff;
  const text = textFromContent(result?.content);
  if (text) return text;
  if (result?.details === undefined) return "";
  return typeof result.details === "string" ? result.details : JSON.stringify(result.details, null, 2);
};

export const imagesFromResult = (result: any): ImagePart[] => extractImages(result);
