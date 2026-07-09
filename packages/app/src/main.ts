import { chdir } from "node:process";
import { AuthStore } from "./adapters/auth/index.ts";
import { AppSession } from "./adapters/session/index.ts";
import { runChatApp } from "./app.ts";
import { TrustStore } from "./adapters/trust/index.ts";
import { parseArgs } from "./args.ts";

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  chdir(args.cwd);
  const authStore = new AuthStore();
  const trustStore = new TrustStore(args.cwd);
  if (!authStore.hasCredentials()) {
    await runChatApp({ cwd: args.cwd, authStore, trustStore, trustPromptOnStart: trustStore.needsPrompt(), firstRunSetup: true, createSession: () => AppSession.create(args.cwd) });
    return;
  }
  const session = await AppSession.create(args.cwd);
  await runChatApp({ cwd: args.cwd, session, authStore, trustStore, trustPromptOnStart: trustStore.needsPrompt(), resumeOnStart: args.resume });
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
