/** Filetypes tree-sitter / CodeRenderable can highlight for pi-common fences. */
const ALIASES: Record<string, string> = {
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescriptreact",
  js: "javascript",
  javascript: "javascript",
  jsx: "javascriptreact",
  py: "python",
  python: "python",
  go: "go",
  rust: "rust",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  json: "json",
  diff: "diff",
};

export function resolveCodeFenceFiletype(lang: string | undefined): string | undefined {
  if (!lang) return undefined;
  const key = lang.trim().toLowerCase().split(/\s+/)[0] ?? "";
  if (!key) return undefined;
  return ALIASES[key];
}

export function isKnownCodeFenceLanguage(lang: string | undefined): boolean {
  return resolveCodeFenceFiletype(lang) !== undefined;
}
