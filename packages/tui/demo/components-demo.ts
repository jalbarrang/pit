import { Box, CancellableLoader, Input, Loader, SelectList, SettingsList, Spacer, Text, TruncatedText, TUI, type SelectItem, type SettingItem } from "../src/index.ts";

const pages = ["basics", "input", "loader", "select", "settings"] as const;
type Page = typeof pages[number];

const tui = await TUI.create();
const root = new Box(tui.renderer, 1, 1, { bg: "#101010" });
let activeLoader: Loader | null = null;
let pageIndex = 0;
tui.addChild(root);

const selectItems: SelectItem[] = Array.from({ length: 50 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Item ${index + 1}`,
  description: `Description for item ${index + 1}`,
}));
const settingsItems: SettingItem[] = [
  { id: "theme", label: "Theme", currentValue: "dark", values: ["dark", "light"] },
  { id: "images", label: "Images", currentValue: "on", values: ["on", "off"] },
];

function header(page: Page): void {
  root.addChild(new Text(tui.renderer, `@pit/tui components demo — ${page}`, 0, 0, { fg: "#7dd3fc", bold: true }));
  root.addChild(new Text(tui.renderer, "Press 1-5 to switch · q/Esc/Ctrl-C exits", 0, 0, { fg: "#a1a1aa" }));
  root.addChild(new Spacer(tui.renderer, 1));
}

function show(page: Page): void {
  activeLoader?.stop();
  root.clear();
  header(page);
  if (page === "basics") showBasics();
  if (page === "input") showInput();
  if (page === "loader") showLoader();
  if (page === "select") showSelect();
  if (page === "settings") showSettings();
  tui.requestRender();
}

function showBasics(): void {
  const box = new Box(tui.renderer, 2, 1, { bg: "#1f2937" });
  box.addChild(new Text(tui.renderer, "Text inside padded Box", 0, 0, { fg: "#e5e7eb" }));
  box.addChild(new TruncatedText(tui.renderer, "TruncatedText: abcdefghijklmnopqrstuvwxyz", 0, 0, { fg: "#facc15" }));
  root.addChild(box);
}

function showInput(): void {
  const input = new Input(tui.renderer);
  input.focused = true;
  input.setValue("type here");
  tui.setFocus(input);
  root.addChild(input);
}

function showLoader(): void {
  activeLoader = new CancellableLoader(tui.renderer, { fg: "#22d3ee" }, { fg: "#e5e7eb" }, "Loading demo — Esc cancels", undefined, undefined, () => tui.requestRender());
  activeLoader.onCancel = () => activeLoader?.setMessage("Cancelled");
  activeLoader.start();
  root.addChild(activeLoader);
}

function showSelect(): void {
  const list = new SelectList(tui.renderer, selectItems, 10);
  tui.setFocus(list);
  root.addChild(list);
}

function showSettings(): void {
  const list = new SettingsList(tui.renderer, settingsItems, 10, {}, () => {}, () => show("basics"));
  tui.setFocus(list);
  root.addChild(list);
}

tui.addInputListener((data) => {
  if (data === "q" || data === "\x03" || data === "\x1b") { activeLoader?.stop(); tui.stop(); process.exit(0); }
  const index = Number(data) - 1;
  if (Number.isInteger(index) && pages[index]) { show(pages[index]); return undefined; }
  return undefined;
});

show(pages[pageIndex]);
const autoCycle = setInterval(() => {
  pageIndex = Math.min(pageIndex + 1, pages.length - 1);
  show(pages[pageIndex]);
  if (pageIndex === pages.length - 1) clearInterval(autoCycle);
}, 400);
setTimeout(() => {
  clearInterval(autoCycle);
  activeLoader?.stop();
  tui.stop();
  console.log("components demo stopped pages=basics,input,loader,select,settings");
}, 2600);
