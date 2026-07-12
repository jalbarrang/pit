import type { SelectorHost } from "./selectors.ts";

interface ValueSink { updateValue(id: string, value: string): void }

/**
 * Persists a settings-overlay change, then applies live side effects:
 * theme repaint, live-session modes (auto-compact/steering/follow-up),
 * and thinking-block visibility.
 */
export const applySettingChange = async (host: SelectorHost, sink: ValueSink, id: string, value: string): Promise<void> => {
  const next = await host.setSetting(id, value);
  if (id === "theme") host.applyTheme(next.theme);
  host.session()?.applySessionSetting?.(id, value);
  if (id === "hideThinkingBlock") host.setThinkingVisible?.(value !== "true");
  sink.updateValue(id, value);
  host.refreshFooter();
};
