import { chdir } from "node:process";
import { AppSession } from "./adapters/session/index.ts";
import { runChatApp } from "./app.ts";
import { parseArgs } from "./args.ts";

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  chdir(args.cwd);
  const session = await AppSession.create(args.cwd);
  await runChatApp({ cwd: args.cwd, session });
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
