export interface KeyEventLike {
  raw?: string;
  sequence?: string;
  source?: "raw" | "kitty";
}
export type KeyEventHandler = (event: KeyEventLike) => void;
export interface KeyEventSource {
  on(event: "keypress", handler: KeyEventHandler): void;
  off(event: "keypress", handler: KeyEventHandler): void;
}
export type InputListenerResult = { consume?: boolean; data?: string } | undefined;
export type InputListener = (data: string) => InputListenerResult;
