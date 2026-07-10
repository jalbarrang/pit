import assert from "node:assert/strict";
import { test } from "node:test";
import { createBuiltinRegistry, type ChromeContext } from "./builtins.ts";

const makeContext = () => {
  const log: string[] = [];
  const context: ChromeContext = {
    notify: (text) => void log.push(`notify:${text}`),
    exit: () => void log.push("exit"),
    openModelSelector: (search) => void log.push(`model:${search}`),
    openThinkingSelector: () => void log.push("thinking"),
    openSessionSelector: () => void log.push("sessions"),
    openThemeSelector: () => void log.push("theme"),
    openSettingsSelector: () => void log.push("settings"),
    openLoginSelector: () => void log.push("login"),
    openHelpSelector: () => void log.push("help"),
    openTrustSelector: () => void log.push("trust"),
    openScopedModels: () => void log.push("scoped-models"),
    openTree: () => void log.push("tree"),
    forkSession: () => void log.push("fork"),
    newSession: () => void log.push("new"),
    renameSession: (args) => void log.push(`name:${args}`),
    showSessionStats: () => void log.push("session"),
    copyLastAssistant: () => void log.push("copy"),
    reloadKeybindings: () => void log.push("reload"),
  };
  return { context, log };
};

test("/resume opens the session selector", async () => {
  const { context, log } = makeContext();
  await createBuiltinRegistry().dispatch("/resume", context);
  assert.deepEqual(log, ["sessions"]);
});

test("/model opens the model selector passing the search term", async () => {
  const { context, log } = makeContext();
  await createBuiltinRegistry().dispatch("/model gpt", context);
  await createBuiltinRegistry().dispatch("/model", context);
  assert.deepEqual(log, ["model:gpt", "model:"]);
});

test("/thinking opens the thinking selector", async () => {
  const { context, log } = makeContext();
  await createBuiltinRegistry().dispatch("/thinking", context);
  assert.deepEqual(log, ["thinking"]);
});

test("chrome commands open selectors", async () => {
  const { context, log } = makeContext();
  for (const command of ["/theme", "/settings", "/login", "/help", "/trust"]) await createBuiltinRegistry().dispatch(command, context);
  assert.deepEqual(log, ["theme", "settings", "login", "help", "trust"]);
});

test("/quit exits via the context port", async () => {
  const { context, log } = makeContext();
  const result = await createBuiltinRegistry().dispatch("/quit", context);
  assert.deepEqual(result, { kind: "handled", name: "quit" });
  assert.deepEqual(log, ["exit"]);
});

test("/reload and /scoped-models dispatch to context ports", async () => {
  const { context, log } = makeContext();
  const registry = createBuiltinRegistry();
  assert.deepEqual(await registry.dispatch("/reload", context), { kind: "handled", name: "reload" });
  assert.deepEqual(await registry.dispatch("/scoped-models", context), { kind: "handled", name: "scoped-models" });
  assert.deepEqual(log, ["reload", "scoped-models"]);
});

test("/tree /fork /new /name /session /copy dispatch to ports", async () => {
  const { context, log } = makeContext();
  const registry = createBuiltinRegistry();
  for (const name of ["tree", "fork", "new", "name", "session", "copy"]) assert.ok(registry.list().some((c) => c.name === name));
  assert.deepEqual(await registry.dispatch("/tree", context), { kind: "handled", name: "tree" });
  assert.deepEqual(await registry.dispatch("/fork", context), { kind: "handled", name: "fork" });
  assert.deepEqual(await registry.dispatch("/new", context), { kind: "handled", name: "new" });
  assert.deepEqual(await registry.dispatch("/name my-session", context), { kind: "handled", name: "name" });
  assert.deepEqual(await registry.dispatch("/session", context), { kind: "handled", name: "session" });
  assert.deepEqual(await registry.dispatch("/copy", context), { kind: "handled", name: "copy" });
  assert.deepEqual(log, ["tree", "fork", "new", "name:my-session", "session", "copy"]);
});

test("every builtin has a description for autocomplete", () => {
  for (const command of createBuiltinRegistry().list()) {
    assert.ok(command.description.length > 0, `${command.name} missing description`);
  }
});
