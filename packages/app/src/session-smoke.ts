import { mkdirSync, writeFileSync } from "node:fs";
import { AppSession } from "./adapters/session/index.ts";

const fixtureUrl = new URL("../test-fixtures/session-smoke-events.jsonl", import.meta.url);
const rawEvents: string[] = [];

const safeJson = (value: unknown): string =>
  JSON.stringify(value, (_key, nested) => (typeof nested === "bigint" ? nested.toString() : nested));

const run = async () => {
  const session = await AppSession.create(process.cwd());
  const unsubscribe = session.subscribe((event) => {
    rawEvents.push(safeJson(event));
    if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") process.stdout.write(event.assistantMessageEvent.delta);
  });
  try {
    await session.prompt("say hi");
    process.stdout.write("\n");
  } finally {
    unsubscribe();
    session.dispose();
    mkdirSync(new URL(".", fixtureUrl), { recursive: true });
    writeFileSync(fixtureUrl, `${rawEvents.join("\n")}\n`);
    console.log(`wrote ${rawEvents.length} events to ${fixtureUrl.pathname}`);
  }
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
