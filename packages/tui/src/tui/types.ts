import type { CliRenderer } from "@opentui/core";
import type { Component } from "../components/index.ts";

export interface TuiConfig {
  renderer?: TuiRenderer;
}

export type TuiRenderer = Pick<CliRenderer, "root" | "requestRender" | "destroy" | "keyInput" | "width" | "height" | "resize" | "on" | "off">;
export type DebugHandler = () => void;
export type TuiComponent = Component;
