import { BoxRenderable, type RenderContext } from "@opentui/core";
import { Container, SettingsList, type Focusable, type SettingItem } from "@pit/tui";

export interface SettingsOverlayOptions {
  items: SettingItem[];
  maxVisible?: number;
  borderColor?: string | number;
}

interface InjectedRenderables { box?: never; list?: never }

const createBox = (ctx: RenderContext, borderColor?: string | number): BoxRenderable =>
  new BoxRenderable(ctx, { flexDirection: "column", width: "100%", height: "auto", border: true, ...(borderColor !== undefined ? { borderColor } : {}) } as never);

export class SettingsOverlay extends Container implements Focusable {
  readonly list: SettingsList;
  onChange?: (id: string, value: string) => void;
  onCancel?: () => void;
  private _focused = false;

  constructor(ctx: RenderContext, options: SettingsOverlayOptions, inject: InjectedRenderables = {}) {
    super(ctx, inject.box ?? createBox(ctx, options.borderColor));
    this.list = new SettingsList(ctx, options.items, options.maxVisible ?? 10, {}, (id, value) => this.onChange?.(id, value), () => this.onCancel?.(), { enableSearch: true }, inject.list);
    this.addChild(this.list);
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; }

  override handleInput(data: string): void { this.list.handleInput(data); }
  setWidth(width: number): void { this.list.setWidth(width - 2); }
  updateValue(id: string, value: string): void { this.list.updateValue(id, value); }
}
