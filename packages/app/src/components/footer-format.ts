import type { TokenUsage } from "../domain/index.ts";

export const formatCwd = (cwd: string, home = process.env.HOME ?? ""): string =>
  home && cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd;

export const formatTokens = (tokens: TokenUsage): string =>
  tokens.total > 0 ? `${tokens.total.toLocaleString()} tok` : "0 tok";

export const formatFooter = (cwd: string, modelId: string, tokens: TokenUsage): string =>
  `${formatCwd(cwd)}  │  ${modelId}  │  ${formatTokens(tokens)}`;
