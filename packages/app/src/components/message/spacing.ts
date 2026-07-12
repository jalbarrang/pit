import type { Renderable } from "@opentui/core";

type Spaced = Renderable & { marginBottom?: unknown };

/** One blank row after a transcript entry — the design system's vertical rhythm. */
export const spaceBelow = (renderable: Renderable, rows = 1): void => {
  (renderable as Spaced).marginBottom = rows;
};
