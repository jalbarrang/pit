import { runChatApp } from "./app.ts";

const lines = Array.from({ length: 30 }, (_, i) => `dummy transcript line ${i + 1}`);
const shell = await runChatApp({ cwd: process.cwd(), dummyLines: lines });
shell.tui.routeKeyEvent({ raw: "h" });
shell.tui.routeKeyEvent({ raw: "i" });
shell.tui.routeKeyEvent({ raw: "\u001b[5~" });
setTimeout(() => {
  console.log(`shell smoke editor=${JSON.stringify(shell.editor.getText())}`);
  console.log(`shell smoke footer=${shell.footer.getText()}`);
  shell.stop();
}, 500);
