import { getAgentDir, SettingsManager } from "@earendil-works/pi-coding-agent";
import {
  defaultPitSettings, parseHttpIdle,
  type PitSettings, type QueueMode, type TransportName, type TreeFilterSetting, type TrustDefault,
} from "../../domain/chrome/index.ts";
import type { ThemeName } from "../../domain/theming/index.ts";

const setters: Record<string, (m: SettingsManager, v: string) => void> = {
  theme: (m, v) => m.setTheme(v as ThemeName),
  autoCompact: (m, v) => m.setCompactionEnabled(v === "true"),
  steeringMode: (m, v) => m.setSteeringMode(v as QueueMode),
  followUpMode: (m, v) => m.setFollowUpMode(v as QueueMode),
  transport: (m, v) => m.setTransport(v as never),
  httpIdleTimeout: (m, v) => { const ms = parseHttpIdle(v); if (ms !== undefined) m.setHttpIdleTimeoutMs(ms); },
  hideThinkingBlock: (m, v) => m.setHideThinkingBlock(v === "true"),
  defaultProjectTrust: (m, v) => m.setDefaultProjectTrust(v as TrustDefault),
  treeFilterMode: (m, v) => m.setTreeFilterMode(v as TreeFilterSetting),
  showImages: (m, v) => m.setShowImages(v === "true"),
  imageWidthCells: (m, v) => m.setImageWidthCells(Number(v)),
  autoResizeImages: (m, v) => m.setImageAutoResize(v === "true"),
  blockImages: (m, v) => m.setBlockImages(v === "true"),
  editorPaddingX: (m, v) => m.setEditorPaddingX(Number(v)),
  autocompleteMaxVisible: (m, v) => m.setAutocompleteMaxVisible(Number(v)),
};

export class SettingsStore {
  private readonly manager: SettingsManager;
  constructor(cwd = process.cwd(), manager = SettingsManager.create(cwd, getAgentDir())) {
    this.manager = manager;
  }

  get(): PitSettings {
    const m = this.manager;
    return {
      theme: m.getTheme() === "light" ? "light" : defaultPitSettings().theme,
      autoCompact: m.getCompactionEnabled(),
      steeringMode: m.getSteeringMode(),
      followUpMode: m.getFollowUpMode(),
      transport: m.getTransport() as TransportName,
      httpIdleTimeoutMs: m.getHttpIdleTimeoutMs(),
      hideThinkingBlock: m.getHideThinkingBlock(),
      defaultProjectTrust: m.getDefaultProjectTrust(),
      treeFilterMode: m.getTreeFilterMode(),
      showImages: m.getShowImages(),
      imageWidthCells: m.getImageWidthCells(),
      autoResizeImages: m.getImageAutoResize(),
      blockImages: m.getBlockImages(),
      editorPaddingX: m.getEditorPaddingX(),
      autocompleteMaxVisible: m.getAutocompleteMaxVisible(),
    };
  }

  async set(key: string, value: string): Promise<PitSettings> {
    setters[key]?.(this.manager, value);
    await this.manager.flush();
    return this.get();
  }

  getEnabledModels(): string[] | undefined {
    return this.manager.getEnabledModels();
  }

  async setEnabledModels(patterns: string[] | undefined): Promise<void> {
    this.manager.setEnabledModels(patterns);
    await this.manager.flush();
  }
}
