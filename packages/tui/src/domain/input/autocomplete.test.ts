import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { NodeFileSearchPort } from "../../adapters/node-file-search.ts";
import { CombinedAutocompleteProvider } from "./index.ts";

const options = () => ({ signal: new AbortController().signal, force: true });
const provider = (commands: ConstructorParameters<typeof CombinedAutocompleteProvider>[0], dir: string) => new CombinedAutocompleteProvider(commands, dir, new NodeFileSearchPort());

describe("CombinedAutocompleteProvider", () => {
  let dir = "";
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "pit-autocomplete-"));
    mkdirSync(join(dir, "src"));
    writeFileSync(join(dir, "README.md"), "readme");
    writeFileSync(join(dir, "src", "index.ts"), "export {};\n");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("extracts root path prefixes when forced", async () => {
    const p = provider([], dir);
    const result = await p.getSuggestions(["hey /"], 0, 5, options());
    assert.equal(result?.prefix, "/");
  });

  it("does not force file suggestions for slash command names", async () => {
    const p = provider([], dir);
    const result = await p.getSuggestions(["/model"], 0, 6, options());
    assert.equal(result, null);
  });

  it("suggests files and directories for @ prefixes", async () => {
    const p = provider([], dir);
    const result = await p.getSuggestions(["@"], 0, 1, options());
    assert.deepEqual(result?.items.map((item) => item.value).sort(), ["@README.md", "@src/"].sort());
  });

  it("applies slash command completions with a trailing space", async () => {
    const p = provider([{ name: "model", description: "Switch" }], dir);
    const result = await p.getSuggestions(["/mo"], 0, 3, { ...options(), force: false });
    const applied = p.applyCompletion(["/mo"], 0, 3, result!.items[0]!, result!.prefix);
    assert.deepEqual(applied, { lines: ["/model "], cursorLine: 0, cursorCol: 7 });
  });

  it("recursively fuzzes @ file suggestions through the file port", async () => {
    mkdirSync(join(dir, "src", "deep"), { recursive: true });
    writeFileSync(join(dir, "src", "deep", "also-index.ts"), "export {};\n");
    const p = provider([], dir);
    const result = await p.getSuggestions(["@index"], 0, 6, options());
    const values = result?.items.map((item) => item.value) ?? [];
    assert.ok(values.includes("@src/index.ts"));
    assert.ok(values.includes("@src/deep/also-index.ts"));
  });
});
