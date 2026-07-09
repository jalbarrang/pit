export interface ImagePart {
  data: string;
  mimeType: string;
  filename?: string;
}

export interface OpenableImage extends ImagePart {
  id: string;
}
