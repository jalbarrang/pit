import type { StyledText } from "@opentui/core";
import { joinStyledLines, styleChunk } from "@pit/tui";
import type { SelectorOverlay, SelectorOverlayOptions } from "../../components/chrome/selector-overlay.ts";
import { findModel, modelSelectItems, type PitSettings } from "../../domain/chrome/index.ts";
import type { PitTheme } from "../../domain/theming/index.ts";
import type { SessionGateway } from "../../domain/index.ts";
import { currentTheme } from "./selector-themes.ts";

export type ModelScope = "all" | "scoped";

export interface ModelSelectorHost {
  session(): SessionGateway | undefined;
  notify(text: string): void;
  settings(): PitSettings;
}

type OpenFn = (options: SelectorOverlayOptions, apply: (value: string) => Promise<void>) => SelectorOverlay | undefined;

// The Night Console: active scope in interactive violet, inactive choice and hint recede to dim.
export const modelScopeHeader = (scope: ModelScope, theme: PitTheme): StyledText =>
  joinStyledLines([[
    styleChunk("scope: ", theme.fg("muted")),
    styleChunk("all", theme.fg(scope === "all" ? "interactive" : "dim")),
    styleChunk(" | ", theme.fg("dim")),
    styleChunk("scoped", theme.fg(scope === "scoped" ? "interactive" : "dim")),
    styleChunk("  · tab to switch", theme.fg("dim")),
  ]]);

/** Scope-aware `/model` selector (pi parity): defaults to the scoped list when one exists; tab flips all/scoped. */
export function openModelSelector(host: ModelSelectorHost, open: OpenFn, search: string): void {
  const session = host.session();
  const models = session?.listModels?.() ?? [];
  if (!session || models.length === 0) return host.notify("No models available — run `pi` login first.");
  const scoped = session.scopedModels?.() ?? [];
  let scope: ModelScope = scoped.length > 0 ? "scoped" : "all";
  const theme = currentTheme(host);
  const listFor = (which: ModelScope) => modelSelectItems(which === "scoped" ? scoped : models, session.modelId);
  const overlay = open({
    ...listFor(scope),
    searchable: true,
    ...(search ? { initialSearch: search } : {}),
    ...(scoped.length > 0 ? { header: modelScopeHeader(scope, theme) } : {}),
  }, async (key) => {
    const model = findModel(models, key) ?? findModel(scoped, key);
    if (model) await session.setModel?.(model);
    host.notify(`Model: ${key}`);
  });
  if (overlay && scoped.length > 0) {
    overlay.onTab = () => {
      scope = scope === "all" ? "scoped" : "all";
      const next = listFor(scope);
      overlay.setItems(next.items, next.initialIndex);
      overlay.setHeader(modelScopeHeader(scope, theme));
    };
  }
}
