import type { TokenUsage } from "../domain/index.ts";

export const emptyTokens = (): TokenUsage => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 });

export const formatCwd = (cwd: string, home = process.env.HOME ?? ""): string =>
  home && cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;

export const formatTokens = (tokens: TokenUsage): string =>
  tokens.total > 0 ? `${tokens.total.toLocaleString()} tok` : "0 tok";

export const formatFooter = (cwd: string, modelId: string, tokens: TokenUsage): string =>
  `${formatCwd(cwd)}  │  ${modelId}  │  ${formatTokens(tokens)}`;
