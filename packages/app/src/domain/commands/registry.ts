export interface CommandDefinition<TContext> {
  name: string;
  description: string;
  handler: (context: TContext, args: string) => void | Promise<void>;
}

export interface CommandInfo {
  name: string;
  description: string;
}

export type DispatchResult =
  | { kind: "not-command" }
  | { kind: "unknown"; name: string }
  | { kind: "handled"; name: string };

export class CommandRegistry<TContext> {
  private readonly commands = new Map<string, CommandDefinition<TContext>>();

  register(definition: CommandDefinition<TContext>): void {
    this.commands.set(definition.name, definition);
  }

  list(): CommandInfo[] {
    return [...this.commands.values()].map(({ name, description }) => ({ name, description }));
  }

  async dispatch(text: string, context: TContext): Promise<DispatchResult> {
    const parsed = parseCommand(text);
    if (!parsed) return { kind: "not-command" };
    const command = this.commands.get(parsed.name);
    if (!command) return { kind: "unknown", name: parsed.name };
    await command.handler(context, parsed.args);
    return { kind: "handled", name: parsed.name };
  }
}

const parseCommand = (text: string): { name: string; args: string } | null => {
  const match = /^\/(\S+)(?:\s+(.*))?$/.exec(text.trim());
  if (!match) return null;
  return { name: match[1]!, args: (match[2] ?? "").trim() };
};
