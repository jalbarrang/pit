import type { RenderContext } from "@opentui/core";
import { Container, SettingsList, type Focusable, type SettingItem, type SettingsListTheme } from "@pit/tui";
import { createOverlayBox } from "./overlay-parts.ts";

export interface SettingsOverlayOptions {
  items: SettingItem[];
  maxVisible?: number;
  borderColor?: string | number;
  listTheme?: SettingsListTheme;
}

interface InjectedRenderables { box?: never; list?: never }

export class SettingsOverlay extends Container implements Focusable {
  readonly list: SettingsList;
  onChange?: (id: string, value: string) => void;
  onCancel?: () => void;
  private _focused = false;

  constructor(ctx: RenderContext, options: SettingsOverlayOptions, inject: InjectedRenderables = {}) {
    super(ctx, inject.box ?? createOverlayBox(ctx, options.borderColor));
    this.list = new SettingsList(ctx, options.items, options.maxVisible ?? 10, options.listTheme ?? {}, (id, value) => this.onChange?.(id, value), () => this.onCancel?.(), { enableSearch: true }, inject.list);
    this.addChild(this.list);
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; }

  override handleInput(data: string): void { this.list.handleInput(data); }
  setWidth(width: number): void { this.list.setWidth(width - 2); }
  updateValue(id: string, value: string): void { this.list.updateValue(id, value); }
}
