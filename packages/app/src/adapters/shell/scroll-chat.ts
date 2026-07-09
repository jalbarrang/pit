import { ScrollBoxRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Component, Text } from "@pit/tui";

type ScrollLike = Renderable & {
  add(child: Renderable): number;
  remove(child: Renderable): void;
  scrollBy(delta: number | { x: number; y: number }, unit?: string): void;
  stickyScroll?: boolean;
  stickyStart?: "bottom" | "top" | "left" | "right";
};

const createScroll = (ctx: RenderContext): ScrollLike =>
  new ScrollBoxRenderable(ctx, {
    width: "100%",
    height: "100%",
    flexGrow: 1,
    stickyScroll: true,
    stickyStart: "bottom",
    scrollY: true,
    scrollX: false,
    contentOptions: { flexDirection: "column", width: "100%" },
  }) as ScrollLike;

export class ScrollChat extends Component {
  readonly renderable: ScrollLike;
  private readonly children: Component[] = [];

  constructor(ctx: RenderContext, renderable?: ScrollLike) {
    super();
    this.renderable = renderable ?? createScroll(ctx);
  }

  addMessage(component: Component): void {
    this.children.push(component);
    this.renderable.add(component.renderable as Renderable);
    this.renderable.stickyScroll = true;
    this.invalidate();
  }

  removeMessage(component: Component): void {
    const index = this.children.indexOf(component);
    if (index >= 0) this.children.splice(index, 1);
    this.renderable.remove(component.renderable as Renderable);
    this.invalidate();
  }

  clear(): void {
    for (const child of [...this.children]) this.removeMessage(child);
  }

  addDummyLines(ctx: RenderContext, lines: string[]): void {
    for (const line of lines) this.addMessage(new Text(ctx, line));
  }

  page(delta: number): void {
    this.renderable.stickyScroll = false;
    this.renderable.scrollBy(delta, "cell");
    this.invalidate();
  }
}
