import { CommandRegistry } from "./registry.ts";

/** Capabilities the app shell exposes to command handlers. Grows as selectors land. */
export interface ChromeContext {
  notify(text: string): void;
  exit(): void;
  openModelSelector(search: string): void;
  openThinkingSelector(): void;
  openSessionSelector(): void;
  openThemeSelector(): void;
  openSettingsSelector(): void;
  openLoginSelector(): void;
  openHelpSelector(): void;
  openTrustSelector(): void;
  openScopedModels(): void;
  openTree(): void;
  forkSession(): void;
  newSession(): void;
  renameSession(args: string): void;
  showSessionStats(): void;
  copyLastAssistant(): void;
  reloadKeybindings(): void;
}

export const createBuiltinRegistry = (): CommandRegistry<ChromeContext> => {
  const registry = new CommandRegistry<ChromeContext>();
  registry.register({ name: "model", description: "Select model (opens selector UI)", handler: (ctx, args) => ctx.openModelSelector(args) });
  registry.register({ name: "thinking", description: "Select thinking level", handler: (ctx) => ctx.openThinkingSelector() });
  registry.register({ name: "resume", description: "Resume a different session", handler: (ctx) => ctx.openSessionSelector() });
  registry.register({ name: "theme", description: "Select color theme", handler: (ctx) => ctx.openThemeSelector() });
  registry.register({ name: "settings", description: "Open settings", handler: (ctx) => ctx.openSettingsSelector() });
  registry.register({ name: "login", description: "Configure model credentials", handler: (ctx) => ctx.openLoginSelector() });
  registry.register({ name: "help", description: "Show keybinding hints", handler: (ctx) => ctx.openHelpSelector() });
  registry.register({ name: "trust", description: "Configure project trust", handler: (ctx) => ctx.openTrustSelector() });
  registry.register({ name: "scoped-models", description: "Choose which models are enabled for cycling", handler: (ctx) => ctx.openScopedModels() });
  registry.register({ name: "tree", description: "Open session tree navigator", handler: (ctx) => ctx.openTree() });
  registry.register({ name: "fork", description: "Fork current session", handler: (ctx) => ctx.forkSession() });
  registry.register({ name: "new", description: "Start a new session", handler: (ctx) => ctx.newSession() });
  registry.register({ name: "name", description: "Show or set the session name", handler: (ctx, args) => ctx.renameSession(args) });
  registry.register({ name: "session", description: "Show session stats", handler: (ctx) => ctx.showSessionStats() });
  registry.register({ name: "copy", description: "Copy last assistant message", handler: (ctx) => ctx.copyLastAssistant() });
  registry.register({ name: "reload", description: "Reload keybindings from ~/.pi/agent/keybindings.json", handler: (ctx) => ctx.reloadKeybindings() });
  registry.register({ name: "quit", description: "Quit pit", handler: (ctx) => ctx.exit() });
  return registry;
};
