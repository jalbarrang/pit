export type ShellClickRegion = "editor" | "tool" | "chat" | "chrome";
export type ShellClickAction = "focus-editor" | "toggle-tool" | "none";

export const shellClickAction = (region: ShellClickRegion): ShellClickAction => {
  if (region === "editor") return "focus-editor";
  if (region === "tool") return "toggle-tool";
  return "none";
};
