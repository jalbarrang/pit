import type { CliRenderer } from "@opentui/core";
import type { Component } from "../components/index.ts";
import type { KeyEventSource } from "./key-source.ts";

export interface TuiConfig {
  renderer?: TuiRenderer;
  keySource?: KeyEventSource;
}

export type TuiRenderer = Pick<CliRenderer, "root" | "requestRender" | "destroy" | "keyInput" | "width" | "height" | "resize" | "on" | "off" | "useMouse">;
export type DebugHandler = () => void;
export type TuiComponent = Component;
