import type { ImagePlaceholderInfo } from "./types.ts";

const displayName = (info: ImagePlaceholderInfo): string => info.filename ?? "image";
const displaySize = (info: ImagePlaceholderInfo): string => info.dimensions ? `${info.dimensions.widthPx}×${info.dimensions.heightPx}` : "unknown size";

export const imageFallbackText = (info: ImagePlaceholderInfo): string =>
  `[Image: ${[info.filename, `[${info.mimeType}]`, info.dimensions && `${info.dimensions.widthPx}x${info.dimensions.heightPx}`].filter(Boolean).join(" ")}]`;

export const formatImagePlaceholder = (info: ImagePlaceholderInfo, width = 44): string[] => {
  const inner = Math.max(16, width - 2);
  const row = (text: string) => `│ ${text.padEnd(inner - 2).slice(0, inner - 2)} │`;
  return [
    `┌${"─".repeat(inner)}┐`,
    row(`Image: ${displayName(info)}`),
    row(`${info.mimeType} · ${displaySize(info)}`),
    row(info.hint ?? "Press Ctrl-Y to open externally"),
    `└${"─".repeat(inner)}┘`,
  ];
};
