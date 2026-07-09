import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../domain/theming/index.ts";
import { formatToolRun } from "./tool-format.ts";
import { ToolExecutionComponent } from "./tool-execution.ts";

const fakeBox = () => ({ add() { return 0; }, requestRender() {}, options: {} }) as unknown as Renderable & { add(child: Renderable): number; options: Record<string, unknown> };
const fakeText = () => ({ content: "", requestRender() {}, options: {} }) as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("ToolExecutionComponent", () => {
  it("renders collapsed and expanded tool output", () => {
    const output = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`).join("\n");
    const run = { id: "1", name: "read", args: { path: "package.json" }, status: "running" as const, output };
    assert.match(formatToolRun(run), /… 2 more lines/);
    const component = new ToolExecutionComponent({} as never, run, createTheme("dark"), fakeBox(), fakeText());
    component.setExpanded(true);
    assert.match(String(component.getText()), /line 1/);
  });
});
