import type { RenderContext, Renderable, StyledText } from "@opentui/core";
import { parseAnsiLine } from "../../domain/styling/ansi/index.ts";
import { Box } from "../box.ts";
import { Text } from "../text.ts";
import type { Focusable } from "../component.ts";
import { ansiChunksToStyledText } from "./chunks-to-styled.ts";
import type { LegacyComponent } from "./legacy.ts";

type TextLike = Renderable & { content: string | StyledText };
type BoxLike = Renderable & { options?: Record<string, unknown> };
type LineFactory = (ctx: RenderContext, content: StyledText) => Text;

export class AnsiBridge extends Box implements Focusable {
  private readonly legacy: LegacyComponent;
  private readonly makeLine: LineFactory;
  private readonly ctx: RenderContext;
  private width = 80;
  private prev: string[] = [];
  private lines: Text[] = [];
  private _focused = false;

  constructor(ctx: RenderContext, legacy: LegacyComponent, box?: BoxLike, makeLine?: LineFactory) {
    super(ctx, 0, 0, undefined, box as never);
    this.ctx = ctx;
    this.legacy = legacy;
    this.makeLine = makeLine ?? ((c, content) => new Text(c, content));
    if (legacy.wantsKeyRelease !== undefined) this.wantsKeyRelease = legacy.wantsKeyRelease;
    this.refresh();
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) {
    this._focused = value;
    if ("focused" in this.legacy) this.legacy.focused = value;
  }

  setWidth(width: number): void {
    if (width === this.width) return;
    this.width = Math.max(1, width);
    this.refresh();
  }

  override handleInput(data: string): void { this.legacy.handleInput?.(data); }

  override invalidate(): void {
    this.legacy.invalidate?.();
    this.refresh();
    super.invalidate();
  }

  refresh(): void {
    const next = this.legacy.render(this.width);
    const keep = Math.min(next.length, this.lines.length);
    for (let i = 0; i < keep; i += 1) this.updateLine(i, next[i]!);
    for (let i = keep; i < next.length; i += 1) this.addLine(i, next[i]!);
    while (this.lines.length > next.length) this.removeChild(this.lines.pop()!);
    this.prev = next;
  }

  lineContent(i: number): string | StyledText | undefined {
    return (this.lines[i]?.renderable as TextLike | undefined)?.content;
  }

  private updateLine(i: number, raw: string): void {
    if (raw === this.prev[i]) return;
    this.lines[i]!.setText(ansiChunksToStyledText(parseAnsiLine(raw)));
  }

  private addLine(i: number, raw: string): void {
    const line = this.makeLine(this.ctx, ansiChunksToStyledText(parseAnsiLine(raw)));
    this.lines[i] = line;
    this.addChild(line);
  }
}
