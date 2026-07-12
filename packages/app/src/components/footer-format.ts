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

export interface FooterChips {
  branch: string;
  cwd: string;
  model: string;
  usage: string;
}

const formatContext = (percent?: number, window?: number): string | undefined => {
  if (percent === undefined) return undefined;
  const base = `ctx ${Math.round(percent)}%`;
  return window === undefined ? base : `${base} of ${Math.round(window / 1000)}k`;
};

const join = (...values: Array<string | undefined>): string => values.filter(Boolean).join(" · ");

export const formatFooter = (info: FooterInfo): FooterChips => ({
  branch: join(info.branch, info.sessionName),
  cwd: formatCwd(info.cwd),
  model: join(info.modelId, info.thinking),
  usage: join(formatTokens(info.tokens), formatContext(info.contextPercent, info.contextWindow)),
});

export const formatFooterPlain = (info: FooterInfo): string => {
  const chips = formatFooter(info);
  return ["pit", chips.branch, chips.cwd, chips.model, chips.usage].filter(Boolean).join("  ");
};
