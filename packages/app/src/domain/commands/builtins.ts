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
}

export const createBuiltinRegistry = (): CommandRegistry<ChromeContext> => {
  const registry = new CommandRegistry<ChromeContext>();
  registry.register({ name: "model", description: "Select model (opens selector UI)", handler: (ctx, args) => ctx.openModelSelector(args) });
  registry.register({ name: "thinking", description: "Select thinking level", handler: (ctx) => ctx.openThinkingSelector() });
  registry.register({ name: "resume", description: "Resume a different session", handler: (ctx) => ctx.openSessionSelector() });
  registry.register({ name: "theme", description: "Select color theme", handler: (ctx) => ctx.openThemeSelector() });
  registry.register({ name: "settings", description: "Open settings", handler: (ctx) => ctx.openSettingsSelector() });
  registry.register({ name: "login", description: "Configure model credentials", handler: (ctx) => ctx.openLoginSelector() });
  registry.register({ name: "quit", description: "Quit pit", handler: (ctx) => ctx.exit() });
  return registry;
};
