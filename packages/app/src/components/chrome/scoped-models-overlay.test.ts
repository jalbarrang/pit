import assert from "node:assert/strict";
import { before, test } from "node:test";
import { KeybindingsManager, setKeybindings } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";
import { ScopedModelsOverlay } from "./scoped-models-overlay.ts";

class FakeRenderable {
  content = ""; visible = true; width?: number; options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
}

const items = [
  { id: "openai/a", label: "openai/a", provider: "openai" },
  { id: "openai/b", label: "openai/b", provider: "openai" },
  { id: "anthropic/c", label: "anthropic/c", provider: "anthropic" },
];
const many = Array.from({ length: 30 }, (_, i) => ({ id: `p/m${i}`, label: `p/m${i}`, provider: "p" }));
const rows = (c: string) => c.split("\n").filter((l) => /\[.\]/.test(l));

before(() => setKeybindings(new KeybindingsManager(APP_KEYBINDINGS)));

const make = (initial: string[] | null = items.map((i) => i.id), opts: { items?: typeof items; maxVisible?: number } = {}) => {
  const changes: Array<string[] | null> = [];
  const persisted: Array<string[] | null> = [];
  let cancelled = 0;
  const body = new FakeRenderable();
  const overlay = new ScopedModelsOverlay({} as never, { items: opts.items ?? items, initial, maxVisible: opts.maxVisible }, {
    box: new FakeRenderable() as never, body: body as never,
  });
  overlay.onChange = (e) => void changes.push(e);
  overlay.onPersist = (e) => void persisted.push(e);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, body, changes, persisted, cancelled: () => cancelled };
};

test("confirm toggles the highlighted model and fires onChange", () => {
  const { overlay, changes } = make();
  overlay.handleInput("\r");
  assert.deepEqual(changes, [["openai/b", "anthropic/c"]]);
});

test("enableAll with an active search only enables filtered ids", () => {
  const { overlay, changes } = make([]);
  for (const ch of "openai") overlay.handleInput(ch);
  overlay.handleInput("\x01");
  assert.deepEqual(changes, [["openai/a", "openai/b"]]);
});

test("reorderDown moves the highlighted enabled id and onChange reflects order", () => {
  const { overlay, changes } = make();
  overlay.handleInput("\x1b[1;3B");
  assert.deepEqual(changes, [["openai/b", "openai/a", "anthropic/c"]]);
});

test("save fires onPersist; cancel clears query then fires onCancel", () => {
  const { overlay, persisted, cancelled } = make(["openai/a"]);
  overlay.handleInput("\x13");
  assert.deepEqual(persisted, [["openai/a"]]);
  for (const ch of "zz") overlay.handleInput(ch);
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 0);
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 1);
});

test("windowing: slice + edge markers scroll; hint present", () => {
  const { overlay, body } = make(null, { items: many, maxVisible: 10 });
  assert.match(body.content, /enter toggle · ctrl\+a all · ctrl\+x none · ctrl\+p provider · alt\+↑↓ order · ctrl\+s save/);
  assert.ok(body.content.includes("↓ 20 more"));
  assert.equal(body.content.split("\n").some((l) => /^↑ \d+ more$/.test(l)), false);
  const before = rows(body.content);
  assert.ok(before[0]!.includes("p/m0"));
  for (let i = 0; i < 10; i++) overlay.handleInput("\x1b[B");
  const mid = rows(body.content);
  assert.ok(mid[0]!.includes("p/m5"));
  assert.notDeepEqual(mid, before);
  for (let i = 0; i < 5; i++) overlay.handleInput("\x1b[B");
  const lines = body.content.split("\n");
  assert.ok(lines.some((l) => l.includes("↑ 10 more")));
  assert.ok(lines.some((l) => l.includes("↓ 10 more")));
  const slice = rows(body.content);
  assert.equal(slice.length, 10);
  assert.ok(slice[0]!.includes("p/m10"));
  assert.ok(slice[9]!.includes("p/m19"));
});
