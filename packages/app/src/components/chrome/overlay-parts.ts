import { BoxRenderable, TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";

export type OverlayTextLike = Renderable & { content: string | StyledText; width?: number };

export const createOverlayBox = (ctx: RenderContext, borderColor?: string | number): BoxRenderable =>
  new BoxRenderable(ctx, { flexDirection: "column", width: "100%", height: "auto", border: true, ...(borderColor !== undefined ? { borderColor } : {}) } as never);

export const createOverlayBody = (ctx: RenderContext): OverlayTextLike =>
  new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as unknown as OverlayTextLike;

/** One character (or paste chunk) of typed text, as opposed to nav/control sequences. */
export const isTextInput = (data: string): boolean => data === "\x7f" || (!data.startsWith("\x1b") && data >= " ");
