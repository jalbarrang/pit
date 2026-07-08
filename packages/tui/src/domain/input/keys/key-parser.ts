import { formatParsedKey } from "./format.ts";
import { parseKittySequence } from "./kitty.ts";
import { SEQ_IDS } from "./legacy.ts";
import { parseModifyOtherKeys } from "./modify-other.ts";
import { isKittyProtocolActive } from "./state.ts";

const isWindowsTerminal = (): boolean => Boolean(process.env.WT_SESSION) && !process.env.SSH_CONNECTION && !process.env.SSH_CLIENT && !process.env.SSH_TTY;

export function parseKey(data: string): string | undefined {
  const kitty = parseKittySequence(data);
  if (kitty) return formatParsedKey(kitty.codepoint, kitty.modifier, kitty.baseLayoutKey);
  const other = parseModifyOtherKeys(data);
  if (other) return formatParsedKey(other.codepoint, other.modifier);
  if (isKittyProtocolActive() && (data === "\x1b\r" || data === "\n")) return "shift+enter";
  const mapped = SEQ_IDS[data];
  if (mapped) return mapped;
  if (data === "\x1b") return "escape";
  if (data === "\x1c") return "ctrl+\\";
  if (data === "\x1d") return "ctrl+]";
  if (data === "\x1f") return "ctrl+-";
  if (data === "\x1b\x1b") return "ctrl+alt+[";
  if (data === "\x1b\x1c") return "ctrl+alt+\\";
  if (data === "\x1b\x1d") return "ctrl+alt+]";
  if (data === "\x1b\x1f") return "ctrl+alt+-";
  if (data === "\t") return "tab";
  if (data === "\r" || (!isKittyProtocolActive() && data === "\n") || data === "\x1bOM") return "enter";
  if (data === "\x00") return "ctrl+space";
  if (data === " ") return "space";
  if (data === "\x7f") return "backspace";
  if (data === "\x08") return isWindowsTerminal() ? "ctrl+backspace" : "backspace";
  if (data === "\x1b[Z") return "shift+tab";
  if (!isKittyProtocolActive() && data === "\x1b\r") return "alt+enter";
  if (data === "\x1b\x7f" || data === "\x1b\b") return "alt+backspace";
  if (!isKittyProtocolActive() && data.length === 2 && data[0] === "\x1b") return parseAlt(data);
  if (data.length !== 1) return undefined;
  const code = data.charCodeAt(0);
  if (code >= 1 && code <= 26) return `ctrl+${String.fromCharCode(code + 96)}`;
  return code >= 32 && code <= 126 ? data : undefined;
}

const parseAlt = (data: string): string | undefined => {
  const code = data.charCodeAt(1);
  if (code >= 1 && code <= 26) return `ctrl+alt+${String.fromCharCode(code + 96)}`;
  if ((code >= 97 && code <= 122) || (code >= 48 && code <= 57)) return `alt+${String.fromCharCode(code)}`;
  return undefined;
};
