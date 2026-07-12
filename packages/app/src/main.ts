import { chdir } from "node:process";
import { channel, version } from "./domain/release-info.ts";
import { AuthStore } from "./adapters/auth/index.ts";
import { AppSession } from "./adapters/session/index.ts";
import { runChatApp } from "./app.ts";
import { TrustStore } from "./adapters/trust/index.ts";
import { parseArgs } from "./args.ts";
import { runUpgrade } from "./cli/upgrade.ts";
import { scheduleStartupUpdateCheck } from "./application/startup-update.ts";

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.version) {
    console.log(`pit ${version} (${channel})`);
    return;
  }
  if (args.upgrade) {
    process.exitCode = await runUpgrade(args.upgrade);
    return;
  }
  chdir(args.cwd);
  const authStore = new AuthStore();
  const trustStore = new TrustStore(args.cwd);
  if (!authStore.hasCredentials()) {
    const shell = await runChatApp({ cwd: args.cwd, authStore, trustStore, trustPromptOnStart: trustStore.needsPrompt(), firstRunSetup: true, createSession: () => AppSession.create(args.cwd) });
    scheduleStartupUpdateCheck((message) => shell.notifyExtension(message));
    return;
  }
  const session = await AppSession.create(args.cwd);
  const shell = await runChatApp({ cwd: args.cwd, session, authStore, trustStore, trustPromptOnStart: trustStore.needsPrompt(), resumeOnStart: args.resume, createSession: () => AppSession.create(args.cwd) });
  scheduleStartupUpdateCheck((message) => shell.notifyExtension(message));
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
