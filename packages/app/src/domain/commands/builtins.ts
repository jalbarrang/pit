import { CommandRegistry } from "./registry.ts";

/** Capabilities the app shell exposes to command handlers. Grows as selectors land. */
export interface ChromeContext {
  notify(text: string): void;
  exit(): void;
}

export const createBuiltinRegistry = (): CommandRegistry<ChromeContext> => {
  const registry = new CommandRegistry<ChromeContext>();
  registry.register({ name: "quit", description: "Quit pit", handler: (ctx) => ctx.exit() });
  return registry;
};
