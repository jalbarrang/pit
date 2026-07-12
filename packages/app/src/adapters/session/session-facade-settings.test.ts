import assert from "node:assert/strict";
import { test } from "node:test";
import { applySessionSettingOf } from "./session-facade-settings.ts";

const makeFake = () => {
  const calls: string[] = [];
  const session = {
    setSteeringMode: (m: string) => void calls.push(`steer:${m}`),
    setFollowUpMode: (m: string) => void calls.push(`follow:${m}`),
    setAutoCompactionEnabled: (e: boolean) => void calls.push(`compact:${e}`),
  };
  return { calls, session: session as never };
};

test("runtime settings reach the live session", () => {
  const { calls, session } = makeFake();
  assert.equal(applySessionSettingOf(session, "autoCompact", "false"), true);
  assert.equal(applySessionSettingOf(session, "steeringMode", "all"), true);
  assert.equal(applySessionSettingOf(session, "followUpMode", "one-at-a-time"), true);
  assert.deepEqual(calls, ["compact:false", "steer:all", "follow:one-at-a-time"]);
});

test("non-runtime settings are reported as unhandled", () => {
  const { calls, session } = makeFake();
  assert.equal(applySessionSettingOf(session, "transport", "sse"), false);
  assert.equal(applySessionSettingOf(session, "theme", "light"), false);
  assert.deepEqual(calls, []);
});
