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

console.log("pit focus demo starting");
const tui = await TUI.create();
const left = new DemoComponent(tui.renderer, "focused: left");
const right = new DemoComponent(tui.renderer, "focus target: right");
tui.addChild(left);
tui.addChild(right);
tui.setFocus(left);
setTimeout(() => tui.setFocus(right), 300);
setTimeout(() => {
  tui.stop();
  console.log("pit focus demo stopped");
}, 900);
