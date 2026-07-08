import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { NodeFileSearchPort } from "../adapters/node-file-search.ts";
import { CombinedAutocompleteProvider } from "../domain/input/index.ts";
import { Editor } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const editor = () => new Editor({} as never, {}, {}, new FakeRenderable() as never);

describe("Editor autocomplete", () => {
  let dir = "";
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "pit-editor-ac-"));
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "package.json"), "{}");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("shows slash commands and accepts one with tab", async () => {
    const e = editor();
    e.setAutocompleteProvider(new CombinedAutocompleteProvider([{ name: "help", description: "Show help" }], dir, new NodeFileSearchPort()));
    e.handleInput("/");
    e.handleInput("h");
    await tick();
    assert.deepEqual(e.getAutocompleteItems().map((item) => item.value), ["help"]);
    e.handleInput("\t");
    assert.equal(e.getText(), "/help ");
  });

  it("shows path completions and accepts one with enter", async () => {
    const e = editor();
    e.setAutocompleteProvider(new CombinedAutocompleteProvider([], dir, new NodeFileSearchPort()));
    for (const ch of "./pack") e.handleInput(ch);
    await tick();
    assert.equal(e.getAutocompleteItems()[0]?.value, "./package.json");
    e.handleInput("\r");
    assert.equal(e.getText(), "./package.json");
  });

  it("dismisses autocomplete with escape", async () => {
    const e = editor();
    e.setAutocompleteProvider(new CombinedAutocompleteProvider([{ name: "help" }], dir, new NodeFileSearchPort()));
    e.handleInput("/");
    await tick();
    assert.equal(e.isShowingAutocomplete(), true);
    e.handleInput("\x1b");
    assert.equal(e.isShowingAutocomplete(), false);
  });
});
