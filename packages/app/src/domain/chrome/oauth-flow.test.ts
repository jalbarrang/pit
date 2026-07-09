import assert from "node:assert/strict";
import { test } from "node:test";
import { nextOAuthFlowState, type OAuthFlowState } from "./oauth-flow.ts";

test("oauth flow records browser and device-code prompts", () => {
  const idle: OAuthFlowState = { kind: "idle" };
  assert.deepEqual(nextOAuthFlowState(idle, { type: "auth-url", url: "https://auth", instructions: "copy" }), { kind: "browser", url: "https://auth", instructions: "copy" });
  assert.deepEqual(nextOAuthFlowState(idle, { type: "device-code", uri: "https://device", code: "ABCD" }), { kind: "device", uri: "https://device", code: "ABCD" });
});

test("oauth flow completes or cancels", () => {
  const waiting: OAuthFlowState = nextOAuthFlowState({ kind: "idle" }, { type: "waiting", message: "Polling" });
  assert.deepEqual(waiting, { kind: "waiting", message: "Polling" });
  assert.deepEqual(nextOAuthFlowState(waiting, { type: "success" }), { kind: "done", ok: true, message: "Login complete" });
  assert.deepEqual(nextOAuthFlowState(waiting, { type: "cancel" }), { kind: "done", ok: false, message: "Login cancelled" });
});
