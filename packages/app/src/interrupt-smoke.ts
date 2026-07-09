import { AppSession } from "./adapters/session/index.ts";
import { runChatApp } from "./app.ts";

let ends = 0;
const session = await AppSession.create(process.cwd());
const shell = await runChatApp({ cwd: process.cwd(), session });
const unsubscribe = session.subscribe((event) => {
  if (event.type === "agent_end" && ++ends >= 2) setTimeout(done, 300);
});

for (const char of "write a long 20 item numbered list") shell.tui.routeKeyEvent({ raw: char });
shell.tui.routeKeyEvent({ raw: "\r" });
setTimeout(() => shell.tui.routeKeyEvent({ raw: "\u001b" }), 3000);
setTimeout(() => {
  for (const char of "say hi") shell.tui.routeKeyEvent({ raw: char });
  shell.tui.routeKeyEvent({ raw: "\r" });
}, 4500);
setTimeout(done, 25_000);

function done() {
  unsubscribe();
  session.dispose();
  shell.stop();
}
