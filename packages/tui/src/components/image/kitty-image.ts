import { BoxRenderable, RGBA, StyledText, TextRenderable, type RenderContext, type Renderable, type TextChunk } from "@opentui/core";
import { terminalWrite, type TerminalWrite } from "../../adapters/terminal-write.ts";
import { allocateKittyImageId, buildKittyDeleteEscape, buildKittyPlacementEscape, buildKittyTransmissionEscapeChunks, calculateImageCellSize, kittyPlaceholderRows, prepareKittyImage } from "../../domain/styling/index.ts";
import { imageMaxWidth } from "./image-mode.ts";
import type { ImageOptions } from "./image.ts";

type KittyFrame = { renderable: Renderable; dispose: () => void };
type Destroyable = Renderable & { once?: (event: string, cb: () => void) => void };

const styledRow = (row: ReturnType<typeof kittyPlaceholderRows>[number]): StyledText => {
  const chunks: TextChunk[] = row.chunks.map((chunk) => ({
    __isChunk: true,
    text: chunk.text,
    fg: RGBA.fromInts(chunk.fg.r, chunk.fg.g, chunk.fg.b, chunk.fg.a),
  }));
  return new StyledText(chunks);
};

const writeAll = (write: TerminalWrite, escapes: string[]): void => {
  for (const escape of escapes) write(escape);
};

export const createKittyImage = (ctx: RenderContext, options: ImageOptions, write: TerminalWrite = terminalWrite): KittyFrame | null => {
  const prepared = prepareKittyImage(options.data, options.mimeType);
  if (!prepared) return null;
  const maxWidth = imageMaxWidth(ctx, options.maxWidthCells);
  const maxHeight = options.maxHeightCells ?? Math.max(1, Math.ceil(maxWidth / 2));
  const cells = calculateImageCellSize(prepared.dimensions, maxWidth, maxHeight);
  const id = allocateKittyImageId();
  writeAll(write, [...buildKittyTransmissionEscapeChunks(prepared.source, id), buildKittyPlacementEscape(id, cells)]);
  const box = new BoxRenderable(ctx, { width: cells.columns, height: cells.rows, flexDirection: "column" }) as Destroyable;
  for (const row of kittyPlaceholderRows(id, cells)) {
    box.add(new TextRenderable(ctx, { content: styledRow(row), width: cells.columns, height: 1, wrapMode: "none" }));
  }
  let deleted = false;
  const dispose = () => {
    if (deleted) return;
    deleted = true;
    write(buildKittyDeleteEscape(id));
  };
  box.once?.("destroyed", dispose);
  return { renderable: box, dispose };
};
