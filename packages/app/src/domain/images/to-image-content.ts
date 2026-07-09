import type { ImagePart } from "./types.ts";

export interface ImageContent {
  type: "image";
  data: string;
  mimeType: string;
}

export const toImageContent = (part: ImagePart): ImageContent => ({
  type: "image",
  data: part.data,
  mimeType: part.mimeType,
});
