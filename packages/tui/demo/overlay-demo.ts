import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Component, TUI } from "../src/index.ts";

class DemoComponent extends Component {
  readonly renderable: Renderable;
  focused = false;
  constructor(ctx: RenderContext, text: string) {
    super();
    this.renderable = new TextRenderable(ctx, { content: text, height: 1 });
  }
}

console.log("pit overlay demo starting");
const tui = await TUI.create();
const base = new DemoComponent(tui.renderer, "base focus restored");
const overlay = new DemoComponent(tui.renderer, "overlay centered 50 percent");
tui.addChild(base);
tui.setFocus(base);
const handle = tui.showOverlay(overlay, { width: "50%", anchor: "center", margin: 1 });
setTimeout(() => handle.hide(), 700);
setTimeout(() => {
  tui.stop();
  console.log(`pit overlay demo stopped focus=${base.focused}`);
}, 1100);
