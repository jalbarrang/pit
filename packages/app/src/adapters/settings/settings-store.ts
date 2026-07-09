import { getAgentDir, SettingsManager } from "@earendil-works/pi-coding-agent";
import { defaultPitSettings, type PitSettings } from "../../domain/chrome/index.ts";
import type { ThemeName } from "../../domain/theming/index.ts";

export class SettingsStore {
  private readonly manager: SettingsManager;
  constructor(cwd = process.cwd(), manager = SettingsManager.create(cwd, getAgentDir())) {
    this.manager = manager;
  }

  get(): PitSettings {
    const defaults = defaultPitSettings();
    const theme = this.manager.getTheme() === "light" ? "light" : defaults.theme;
    return {
      theme,
      showImages: this.manager.getShowImages(),
      autoResizeImages: this.manager.getImageAutoResize(),
      blockImages: this.manager.getBlockImages(),
      editorPaddingX: this.manager.getEditorPaddingX(),
      autocompleteMaxVisible: this.manager.getAutocompleteMaxVisible(),
    };
  }

  async set(key: string, value: string): Promise<PitSettings> {
    if (key === "theme") this.manager.setTheme(value as ThemeName);
    else if (key === "showImages") this.manager.setShowImages(value === "true");
    else if (key === "autoResizeImages") this.manager.setImageAutoResize(value === "true");
    else if (key === "blockImages") this.manager.setBlockImages(value === "true");
    else if (key === "editorPaddingX") this.manager.setEditorPaddingX(Number(value));
    else if (key === "autocompleteMaxVisible") this.manager.setAutocompleteMaxVisible(Number(value));
    await this.manager.flush();
    return this.get();
  }
}
