import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cycleFilter, nodeVisible, type TreeFilter } from "./filters.ts";
import type { TreeNode } from "./types.ts";

const n = (partial: Partial<TreeNode> & Pick<TreeNode, "id" | "kind">): TreeNode => ({
  text: partial.text ?? partial.id,
  children: partial.children ?? [],
  ...partial,
});

describe("nodeVisible", () => {
  // Upstream default hides settings/bookkeeping (kind "other"), not tools.
  it("default hides other; shows user/assistant/tool", () => {
    assert.equal(nodeVisible("default", n({ id: "o", kind: "other" })), false);
    assert.equal(nodeVisible("default", n({ id: "t", kind: "tool" })), true);
    assert.equal(nodeVisible("default", n({ id: "u", kind: "user" })), true);
  });
  it("noTools hides tool and other", () => {
    assert.equal(nodeVisible("noTools", n({ id: "t", kind: "tool" })), false);
    assert.equal(nodeVisible("noTools", n({ id: "o", kind: "other" })), false);
    assert.equal(nodeVisible("noTools", n({ id: "a", kind: "assistant" })), true);
  });
  it("userOnly requires kind user", () => {
    assert.equal(nodeVisible("userOnly", n({ id: "u", kind: "user" })), true);
    assert.equal(nodeVisible("userOnly", n({ id: "a", kind: "assistant" })), false);
  });
  it("labeledOnly requires label present", () => {
    assert.equal(nodeVisible("labeledOnly", n({ id: "a", kind: "user", label: "x" })), true);
    assert.equal(nodeVisible("labeledOnly", n({ id: "b", kind: "user" })), false);
  });
  it("all is always true", () => {
    assert.equal(nodeVisible("all", n({ id: "o", kind: "other" })), true);
  });
});

describe("cycleFilter", () => {
  const order: TreeFilter[] = ["default", "noTools", "userOnly", "labeledOnly", "all"];
  it("cycles forward and wraps", () => {
    for (let i = 0; i < order.length; i++) {
      assert.equal(cycleFilter(order[i]!, 1), order[(i + 1) % order.length]);
    }
  });
  it("cycles backward and wraps", () => {
    for (let i = 0; i < order.length; i++) {
      assert.equal(cycleFilter(order[i]!, -1), order[(i - 1 + order.length) % order.length]);
    }
  });
});
