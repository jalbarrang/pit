import type { SettingItem } from "@pit/tui";
import type { ThemeName } from "../theming/index.ts";
import { formatHttpIdle, httpIdleLabels } from "./http-idle.ts";

export type QueueMode = "one-at-a-time" | "all";
export type TransportName = "sse" | "websocket" | "websocket-cached" | "auto";
export type TrustDefault = "ask" | "always" | "never";
export type TreeFilterSetting = "default" | "no-tools" | "user-only" | "labeled-only" | "all";

export interface PitSettings {
  theme: ThemeName;
  autoCompact: boolean;
  steeringMode: QueueMode;
  followUpMode: QueueMode;
  transport: TransportName;
  httpIdleTimeoutMs: number;
  hideThinkingBlock: boolean;
  defaultProjectTrust: TrustDefault;
  treeFilterMode: TreeFilterSetting;
  showImages: boolean;
  imageWidthCells: number;
  autoResizeImages: boolean;
  blockImages: boolean;
  editorPaddingX: number;
  autocompleteMaxVisible: number;
}

export type PitSettingKey = keyof PitSettings;

export const defaultPitSettings = (): PitSettings => ({
  theme: "dark",
  autoCompact: true,
  steeringMode: "one-at-a-time",
  followUpMode: "one-at-a-time",
  transport: "auto",
  httpIdleTimeoutMs: 300_000,
  hideThinkingBlock: false,
  defaultProjectTrust: "ask",
  treeFilterMode: "default",
  showImages: true,
  imageWidthCells: 60,
  autoResizeImages: true,
  blockImages: false,
  editorPaddingX: 0,
  autocompleteMaxVisible: 5,
});

const QUEUE_MODES: QueueMode[] = ["one-at-a-time", "all"];

export const settingsItems = (s: PitSettings): SettingItem[] => [
  { id: "theme", label: "Theme", description: "Color theme for pit", currentValue: s.theme, values: ["dark", "light"] },
  boolItem("autoCompact", "Auto-compact", "Automatically compact context when it gets too large", s.autoCompact),
  { id: "steeringMode", label: "Steering mode", description: "How queued steering messages are delivered while streaming", currentValue: s.steeringMode, values: QUEUE_MODES },
  { id: "followUpMode", label: "Follow-up mode", description: "How queued follow-up messages are delivered when the agent stops", currentValue: s.followUpMode, values: QUEUE_MODES },
  { id: "transport", label: "Transport", description: "Preferred transport for providers that support multiple transports (next session)", currentValue: s.transport, values: ["sse", "websocket", "websocket-cached", "auto"] },
  { id: "httpIdleTimeout", label: "HTTP idle timeout", description: "Max idle gap waiting for HTTP headers or body chunks (next session)", currentValue: formatHttpIdle(s.httpIdleTimeoutMs), values: httpIdleLabels() },
  boolItem("hideThinkingBlock", "Hide thinking", "Collapse thinking blocks in assistant responses by default", s.hideThinkingBlock),
  { id: "defaultProjectTrust", label: "Default project trust", description: "Fallback when no saved trust decision exists", currentValue: s.defaultProjectTrust, values: ["ask", "always", "never"] },
  { id: "treeFilterMode", label: "Tree filter mode", description: "Default filter when opening /tree", currentValue: s.treeFilterMode, values: ["default", "no-tools", "user-only", "labeled-only", "all"] },
  boolItem("showImages", "Show images", "Render images inline when image chrome lands", s.showImages),
  { id: "imageWidthCells", label: "Image width", description: "Preferred inline image width in terminal cells", currentValue: String(s.imageWidthCells), values: ["60", "80", "120"] },
  boolItem("autoResizeImages", "Auto-resize images", "Resize large images before model upload", s.autoResizeImages),
  boolItem("blockImages", "Block images", "Prevent images from being sent to providers", s.blockImages),
  { id: "editorPaddingX", label: "Editor padding", description: "Horizontal editor padding", currentValue: String(s.editorPaddingX), values: ["0", "1", "2", "3"] },
  { id: "autocompleteMaxVisible", label: "Autocomplete max items", description: "Max visible autocomplete rows", currentValue: String(s.autocompleteMaxVisible), values: ["3", "5", "7", "10", "15", "20"] },
];

const boolItem = (id: string, label: string, description: string, value: boolean): SettingItem =>
  ({ id, label, description, currentValue: value ? "true" : "false", values: ["true", "false"] });
