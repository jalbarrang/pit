export type OverlayAnchor = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center" | "left-center" | "right-center";

export function resolveAnchorRow(anchor: OverlayAnchor, height: number, availHeight: number, marginTop: number): number {
  if (anchor.startsWith("top-")) return marginTop;
  if (anchor.startsWith("bottom-")) return marginTop + availHeight - height;
  return marginTop + Math.floor((availHeight - height) / 2);
}

export function resolveAnchorCol(anchor: OverlayAnchor, width: number, availWidth: number, marginLeft: number): number {
  if (anchor.endsWith("-left") || anchor === "left-center") return marginLeft;
  if (anchor.endsWith("-right") || anchor === "right-center") return marginLeft + availWidth - width;
  return marginLeft + Math.floor((availWidth - width) / 2);
}
