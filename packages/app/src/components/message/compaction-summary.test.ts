import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import { CompactionSummaryComponent } from "./compaction-summary.ts";

class FakeText {
  content = "";
  options: Record<string, unknown> = {};
  requestRender() {}
}
const fakeText = () => new FakeText() as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("CompactionSummaryComponent", () => {
  it("renders empty string before setSummary", () => {
    const renderable = fakeText();
    new CompactionSummaryComponent({} as never, createTheme("dark"), renderable);
    assert.equal(renderable.content, "");
  });

  it("collapsed shows before→after tokens when after is present", () => {
    const renderable = fakeText();
    const component = new CompactionSummaryComponent({} as never, createTheme("dark"), renderable);
    component.setSummary("full summary text", 1200, 400);
    assert.equal(renderable.content, "Compaction summary (1200→400 tokens)");
  });

  it("collapsed shows before tokens only when after is absent", () => {
    const renderable = fakeText();
    const component = new CompactionSummaryComponent({} as never, createTheme("dark"), renderable);
    component.setSummary("full summary text", 1200);
    assert.equal(renderable.content, "Compaction summary (1200 tokens)");
  });

  it("expanded shows the full summary text", () => {
    const renderable = fakeText();
    const component = new CompactionSummaryComponent({} as never, createTheme("dark"), renderable);
    component.setSummary("full summary text", 1200, 400);
    component.setExpanded(true);
    assert.equal(renderable.content, "full summary text");
  });
});
