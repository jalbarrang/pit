import type { OverlayAnchor } from "./anchor-resolver.ts";
import type { SizeValue } from "./size-value.ts";

export interface OverlayMargin { top?: number; right?: number; bottom?: number; left?: number }
export interface OverlayOptions {
  width?: SizeValue;
  minWidth?: number;
  maxHeight?: SizeValue;
  anchor?: OverlayAnchor;
  offsetX?: number;
  offsetY?: number;
  row?: SizeValue;
  col?: SizeValue;
  margin?: OverlayMargin | number;
  visible?: (termWidth: number, termHeight: number) => boolean;
  nonCapturing?: boolean;
}
export interface OverlayUnfocusOptions { target: unknown | null }
export interface OverlayHandle {
  hide(): void;
  setHidden(hidden: boolean): void;
  isHidden(): boolean;
  focus(): void;
  unfocus(options?: OverlayUnfocusOptions): void;
  isFocused(): boolean;
}
