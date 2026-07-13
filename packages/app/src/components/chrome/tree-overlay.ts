import { type BoxRenderable, type RenderContext } from "@opentui/core";
import { Container, getKeybindings, type Focusable } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import {
  cycleFilter, filterRows, flattenVisible, foldOrUp, moveSelection, unfoldOrDown,
  type TreeFilter, type TreeNode, type TreeRow,
} from "../../domain/tree/index.ts";
import { createOverlayBody, createOverlayBox, isTextInput, type OverlayTextLike } from "./overlay-parts.ts";
import { formatTreeOverlayLines } from "./tree-overlay-rows.ts";
import { formatTreeOverlayStyled } from "./tree-overlay-styled.ts";

export interface TreeOverlayOptions { nodes: TreeNode[]; leafId?: string; maxVisible?: number; initialFilter?: TreeFilter; theme?: PitTheme }
interface Injected { box?: BoxRenderable; body?: OverlayTextLike }

export class TreeOverlay extends Container implements Focusable {
  readonly body: OverlayTextLike;
  onSelect?: (id: string) => void;
  onCancel?: () => void;
  onEditLabel?: (id: string) => void;
  private readonly nodes: TreeNode[];
  private readonly leafId?: string;
  private readonly maxVisible: number;
  private folded = new Set<string>();
  private selectedId: string | undefined;
  private filter: TreeFilter = "default";
  private query = "";
  private showTimestamps = false;
  private _focused = false;
  private readonly theme?: PitTheme;
  private width = 78;

  constructor(ctx: RenderContext, options: TreeOverlayOptions, inject: Injected = {}) {
    super(ctx, inject.box ?? createOverlayBox(ctx, options.theme?.color("borderMuted")));
    this.theme = options.theme;
    this.nodes = options.nodes;
    this.leafId = options.leafId;
    this.maxVisible = options.maxVisible ?? 12; this.filter = options.initialFilter ?? this.filter;
    this.body = inject.body ?? createOverlayBody(ctx);
    this.renderable.add(this.body);
    const rows = this.rows();
    this.selectedId = options.leafId && rows.some((r) => r.id === options.leafId) ? options.leafId : rows[0]?.id;
    this.paint();
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; }
  setWidth(width: number): void { this.width = width - 2; this.body.width = width - 2; this.paint(); }

  handleInput(data: string): void {
    const kb = getKeybindings();
    const nav = () => ({ folded: this.folded, selectedId: this.selectedId });
    const apply = (s: { folded: ReadonlySet<string>; selectedId: string | undefined }) => {
      this.folded = new Set(s.folded); this.selectedId = s.selectedId;
    };
    if (kb.matches(data, "tui.select.up")) apply(moveSelection(nav(), this.rows(), -1));
    else if (kb.matches(data, "tui.select.down")) apply(moveSelection(nav(), this.rows(), 1));
    else if (kb.matches(data, "app.tree.foldOrUp")) apply(foldOrUp(nav(), this.rows()));
    else if (kb.matches(data, "app.tree.unfoldOrDown")) apply(unfoldOrDown(nav(), this.rows()));
    else if (kb.matches(data, "app.tree.filter.default")) this.setFilter("default");
    else if (kb.matches(data, "app.tree.filter.noTools")) this.setFilter("noTools");
    else if (kb.matches(data, "app.tree.filter.userOnly")) this.setFilter("userOnly");
    else if (kb.matches(data, "app.tree.filter.labeledOnly")) this.setFilter("labeledOnly");
    else if (kb.matches(data, "app.tree.filter.all")) this.setFilter("all");
    else if (kb.matches(data, "app.tree.filter.cycleForward")) this.setFilter(cycleFilter(this.filter, 1));
    else if (kb.matches(data, "app.tree.filter.cycleBackward")) this.setFilter(cycleFilter(this.filter, -1));
    else if (kb.matches(data, "app.tree.editLabel") && this.selectedId) this.onEditLabel?.(this.selectedId);
    else if (kb.matches(data, "app.tree.toggleLabelTimestamp")) this.showTimestamps = !this.showTimestamps;
    else if (kb.matches(data, "tui.select.confirm") && this.selectedId) this.onSelect?.(this.selectedId);
    else if (kb.matches(data, "tui.select.cancel")) this.cancelOrClear();
    else if (isTextInput(data)) this.type(data);
    this.paint();
  }

  private setFilter(filter: TreeFilter): void {
    this.filter = filter; this.folded = new Set(); this.clampSelection();
  }
  private cancelOrClear(): void {
    if (this.query) { this.query = ""; this.clampSelection(); return; }
    this.onCancel?.();
  }
  private type(data: string): void {
    this.query = data === "\x7f" ? this.query.slice(0, -1) : this.query + data;
    this.clampSelection();
  }
  private clampSelection(): void {
    const rows = this.rows();
    if (rows.length === 0) { this.selectedId = undefined; return; }
    if (!rows.some((r) => r.id === this.selectedId)) this.selectedId = rows[0]!.id;
  }
  private rows(): TreeRow[] {
    return filterRows(flattenVisible(this.nodes, this.folded, this.filter), this.query);
  }
  private paint(): void {
    this.body.content = this.theme
      ? formatTreeOverlayStyled(this.rows(), this.selectedId, this.filter, this.query, this.leafId, this.showTimestamps, this.maxVisible, this.theme, this.width)
      : formatTreeOverlayLines(this.rows(), this.selectedId, this.filter, this.query, this.leafId, this.showTimestamps, this.maxVisible).join("\n");
    this.invalidate();
  }
}
