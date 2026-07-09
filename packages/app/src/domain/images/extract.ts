import type { ImagePart } from "./types.ts";

const isImage = (part: any): part is ImagePart =>
  part?.type === "image" && typeof part.data === "string" && typeof part.mimeType === "string";

export const extractImages = (result: any): ImagePart[] => {
  const content = Array.isArray(result?.content) ? result.content : [];
  return content.filter(isImage).map((part: ImagePart & { name?: string }) => ({ data: part.data, mimeType: part.mimeType, filename: part.filename ?? part.name }));
};
