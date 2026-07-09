import { TUI_KEYBINDINGS } from "@pit/tui";
import type { KeybindingDefinitions } from "@pit/tui";
import { APP_ONLY_KEYBINDINGS } from "./definitions-app.ts";

export interface AppKeybindings {
  "app.interrupt": true; "app.clear": true; "app.exit": true; "app.suspend": true;
  "app.thinking.cycle": true; "app.model.cycleForward": true; "app.model.cycleBackward": true;
  "app.model.select": true; "app.tools.expand": true; "app.thinking.toggle": true;
  "app.session.toggleNamedFilter": true; "app.editor.external": true;
  "app.message.followUp": true; "app.message.dequeue": true; "app.clipboard.pasteImage": true;
  "app.session.new": true; "app.session.tree": true; "app.session.fork": true; "app.session.resume": true;
  "app.tree.foldOrUp": true; "app.tree.unfoldOrDown": true; "app.tree.editLabel": true;
  "app.tree.toggleLabelTimestamp": true; "app.session.togglePath": true; "app.session.toggleSort": true;
  "app.session.rename": true; "app.session.delete": true; "app.session.deleteNoninvasive": true;
  "app.models.save": true; "app.models.enableAll": true; "app.models.clearAll": true;
  "app.models.toggleProvider": true; "app.models.reorderUp": true; "app.models.reorderDown": true;
  "app.tree.filter.default": true; "app.tree.filter.noTools": true; "app.tree.filter.userOnly": true;
  "app.tree.filter.labeledOnly": true; "app.tree.filter.all": true;
  "app.tree.filter.cycleForward": true; "app.tree.filter.cycleBackward": true;
}

declare module "@pit/tui" {
  interface Keybindings extends AppKeybindings {}
}

export const APP_KEYBINDINGS = {
  ...TUI_KEYBINDINGS,
  ...APP_ONLY_KEYBINDINGS,
} as const satisfies KeybindingDefinitions;
