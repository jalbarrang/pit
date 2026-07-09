import { AppSession } from "./adapters/session/index.ts";
import { runChatApp } from "./app.ts";

const session = await AppSession.create(process.cwd());
const shell = await runChatApp({ cwd: process.cwd(), session });
const unsubscribe = session.subscribe((event) => {
  if (event.type === "agent_end") setTimeout(done, 300);
});

for (const char of process.env.PIT_SMOKE_PROMPT ?? "say hi") shell.tui.routeKeyEvent({ raw: char });
shell.tui.routeKeyEvent({ raw: "\r" });
setTimeout(done, 20_000);

function done() {
  unsubscribe();
  session.dispose();
  shell.stop();
}
