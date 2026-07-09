import { CommandRegistry } from "./registry.ts";

/** Capabilities the app shell exposes to command handlers. Grows as selectors land. */
export interface ChromeContext {
  notify(text: string): void;
  exit(): void;
  openModelSelector(search: string): void;
  openThinkingSelector(): void;
}

export const createBuiltinRegistry = (): CommandRegistry<ChromeContext> => {
  const registry = new CommandRegistry<ChromeContext>();
  registry.register({ name: "model", description: "Select model (opens selector UI)", handler: (ctx, args) => ctx.openModelSelector(args) });
  registry.register({ name: "thinking", description: "Select thinking level", handler: (ctx) => ctx.openThinkingSelector() });
  registry.register({ name: "quit", description: "Quit pit", handler: (ctx) => ctx.exit() });
  return registry;
};
