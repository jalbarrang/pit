const delimiters = new Set([" ", "\t", "'", '"', "="]);
const lastDelimiter = (text: string): number => {
  for (let i = text.length - 1; i >= 0; i--) if (delimiters.has(text[i]!)) return i;
  return -1;
};
const quotedStart = (text: string): number | null => {
  let start = -1;
  let open = false;
  for (let i = 0; i < text.length; i++) if (text[i] === '"') { open = !open; if (open) start = i; }
  return open ? start : null;
};
const tokenStart = (text: string, index: number): boolean => index === 0 || delimiters.has(text[index - 1]!);

export const extractQuotedPrefix = (text: string): string | null => {
  const start = quotedStart(text);
  if (start === null) return null;
  if (start > 0 && text[start - 1] === "@") return tokenStart(text, start - 1) ? text.slice(start - 1) : null;
  return tokenStart(text, start) ? text.slice(start) : null;
};

export const extractAtPrefix = (text: string): string | null => {
  const quoted = extractQuotedPrefix(text);
  if (quoted?.startsWith('@"')) return quoted;
  const start = lastDelimiter(text) + 1;
  return text[start] === "@" ? text.slice(start) : null;
};

export const extractPathPrefix = (text: string, force = false): string | null => {
  const quoted = extractQuotedPrefix(text);
  if (quoted) return quoted;
  const pathPrefix = text.slice(lastDelimiter(text) + 1);
  if (force) return pathPrefix;
  if (pathPrefix.includes("/") || pathPrefix.startsWith(".") || pathPrefix.startsWith("~/")) return pathPrefix;
  return pathPrefix === "" && text.endsWith(" ") ? pathPrefix : null;
};
