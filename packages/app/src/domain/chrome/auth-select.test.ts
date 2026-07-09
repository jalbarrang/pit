import assert from "node:assert/strict";
import { test } from "node:test";
import { authProviderItems } from "./auth-select.ts";

test("auth provider items show auth type and configured state", () => {
  const items = authProviderItems([
    { id: "anthropic", name: "Anthropic", authType: "api_key", configured: true },
    { id: "github-copilot", name: "GitHub Copilot", authType: "oauth" },
  ]);
  assert.deepEqual(items.map((item) => item.value), ["anthropic", "github-copilot"]);
  assert.equal(items[0]!.description, "API key · configured");
  assert.equal(items[1]!.description, "OAuth");
});
