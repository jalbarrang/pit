import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { AppSession } from "../session/app-session.ts";
import { createPitUIContext, type BindHost } from "./create-ui-context.ts";

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/pit-confirm.ts");

describe("extension live gate", () => {
  it("loads pit-confirm, opens confirm via UIContext, returns yes", async () => {
    const notifies: string[] = [];
    const host: BindHost = {
      tui: () => ({ ctx: {}, showOverlay: () => ({ hide() {} }), renderer: { width: 80 } } as never),
      notify: (m) => notifies.push(m),
      getEditor: () => ({ getText: () => "", setText() {}, handleInput() {} } as never),
      getToolsExpanded: () => false,
      setToolsExpanded() {},
      theme: { name: "dark" } as Theme,
    };
    const ui = createPitUIContext(host);
    ui.confirm = async () => true;
    ui.notify = (m) => notifies.push(m);

    const session = await AppSession.createWithExtensions({
      cwd: process.cwd(),
      // Credential-less: the gate tests the extension binding contract, not
      // model auth, and must run in CI where no pi login exists.
      authPath: path.join(os.tmpdir(), "pit-live-gate-no-auth.json"),
      requireAuth: false,
      extensionPaths: [fixture],
      sessionManager: SessionManager.inMemory(),
    });
    try {
      await session.bindUI(ui);
      const cmd = session.extensionRunner.getCommand("pit-confirm");
      assert.ok(cmd, "pit-confirm command registered");
      await cmd!.handler("", session.extensionRunner.createCommandContext());
      assert.ok(notifies.includes("gate:yes"), `expected gate:yes in ${JSON.stringify(notifies)}`);
    } finally {
      session.dispose();
    }
  });
});
