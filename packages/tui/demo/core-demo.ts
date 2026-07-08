import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Component, TUI } from "../src/index.ts";

class DemoComponent extends Component {
  readonly renderable: Renderable;
  focused = false;
  private text: TextRenderable;
  constructor(ctx: RenderContext, content: string) {
    super();
    this.text = new TextRenderable(ctx, { content, height: 1 });
    this.renderable = this.text;
  }
  handleInput(data: string): void {
    this.text.content = `last input: ${JSON.stringify(data)}`;
  }
}

console.log("pit core demo starting");
const tui = await TUI.create();
const left = new DemoComponent(tui.renderer, "left focus target");
const right = new DemoComponent(tui.renderer, "right focus target");
const overlay = new DemoComponent(tui.renderer, "bottom-right overlay margin 2");
tui.addChild(left);
tui.addChild(right);
tui.setFocus(left);
tui.addInputListener((data) => ({ data: data.toUpperCase() }));
const handle = tui.showOverlay(overlay, { width: "50%", anchor: "bottom-right", margin: 2, nonCapturing: true });
tui.routeKeyEvent({ raw: "x" });
setTimeout(() => tui.setFocus(right), 400);
setTimeout(() => handle.hide(), 800);
setTimeout(() => {
  tui.stop();
  console.log(`pit core demo stopped left=${left.focused} right=${right.focused}`);
}, 1200);
