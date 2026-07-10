import type { TokenUsage } from "../domain/index.ts";

export const emptyTokens = (): TokenUsage => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 });

export const formatCwd = (cwd: string, home = process.env.HOME ?? ""): string =>
  home && cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;

export const formatTokens = (tokens: TokenUsage): string =>
  tokens.total > 0 ? `${tokens.total.toLocaleString()} tok` : "0 tok";

export type FooterInfo = {
  cwd: string;
  modelId: string;
  tokens: TokenUsage;
  branch?: string;
  sessionName?: string;
  thinking?: string;
  contextPercent?: number;
  contextWindow?: number;
};

const formatContext = (percent?: number, window?: number): string | undefined => {
  if (percent === undefined) return undefined;
  const base = `ctx ${Math.round(percent)}%`;
  return window === undefined ? base : `${base} of ${Math.round(window / 1000)}k`;
};

export const formatFooter = (info: FooterInfo): string =>
  [
    formatCwd(info.cwd),
    info.branch,
    info.sessionName,
    info.modelId,
    info.thinking,
    formatTokens(info.tokens),
    formatContext(info.contextPercent, info.contextWindow),
  ]
    .filter((s): s is string => !!s)
    .join("  │  ");
