import type { Renderable } from "@opentui/core";

type Spaced = Renderable & { marginBottom?: unknown };

/** Shared horizontal inset for transcript text and metadata. */
export const TRANSCRIPT_GUTTER = 1;
/** User turns sit one rung closer than streamed output. */
export const USER_MESSAGE_GUTTER = 2;
/** Gap after a user turn — the slab's padding already marks the boundary, so one row is enough. */
export const TURN_GAP_ROWS = 1;

/** One blank row after a transcript entry — the design system's vertical rhythm. */
export const spaceBelow = (renderable: Renderable, rows = 1): void => {
  (renderable as Spaced).marginBottom = rows;
};
