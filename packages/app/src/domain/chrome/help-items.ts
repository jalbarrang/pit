import type { SelectItem } from "@pit/tui";

export const keybindingHelpItems = (): SelectItem[] => [
  { value: "slash", label: "/", description: "Show slash commands and file autocomplete" },
  { value: "escape", label: "Esc", description: "Cancel overlay or abort an active stream" },
  { value: "ctrl-o", label: "Ctrl+O", description: "Toggle tool output expansion" },
  { value: "page", label: "PageUp/PageDown", description: "Scroll chat history" },
  { value: "ctrl-c", label: "Ctrl+C Ctrl+C", description: "Exit pit" },
];
