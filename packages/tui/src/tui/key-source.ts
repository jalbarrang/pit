export interface KeyEventLike {
  raw?: string;
  sequence?: string;
  source?: "raw" | "kitty";
}
export type KeyEventHandler = (event: KeyEventLike) => void;
export interface PasteEventLike {
  bytes?: Uint8Array;
  text?: string;
}
export type PasteEventHandler = (event: PasteEventLike) => void;
export interface KeyEventSource {
  on(event: "keypress", handler: KeyEventHandler): void;
  on(event: "paste", handler: PasteEventHandler): void;
  off(event: "keypress", handler: KeyEventHandler): void;
  off(event: "paste", handler: PasteEventHandler): void;
}
export type InputListenerResult = { consume?: boolean; data?: string } | undefined;
export type InputListener = (data: string) => InputListenerResult;
