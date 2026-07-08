export const LEGACY: Record<string, readonly string[]> = {
  up: ["\x1b[A", "\x1bOA"],
  down: ["\x1b[B", "\x1bOB"],
  right: ["\x1b[C", "\x1bOC"],
  left: ["\x1b[D", "\x1bOD"],
  home: ["\x1b[H", "\x1bOH", "\x1b[1~", "\x1b[7~"],
  end: ["\x1b[F", "\x1bOF", "\x1b[4~", "\x1b[8~"],
  insert: ["\x1b[2~"],
  delete: ["\x1b[3~"],
  pageUp: ["\x1b[5~", "\x1b[[5~"],
  pageDown: ["\x1b[6~", "\x1b[[6~"],
  clear: ["\x1b[E", "\x1bOE"],
  f1: ["\x1bOP", "\x1b[11~", "\x1b[[A"],
  f2: ["\x1bOQ", "\x1b[12~", "\x1b[[B"],
  f3: ["\x1bOR", "\x1b[13~", "\x1b[[C"],
  f4: ["\x1bOS", "\x1b[14~", "\x1b[[D"],
  f5: ["\x1b[15~", "\x1b[[E"],
  f6: ["\x1b[17~"],
  f7: ["\x1b[18~"],
  f8: ["\x1b[19~"],
  f9: ["\x1b[20~"],
  f10: ["\x1b[21~"],
  f11: ["\x1b[23~"],
  f12: ["\x1b[24~"],
};

export const SEQ_IDS: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY).flatMap(([key, sequences]) => sequences.map((sequence) => [sequence, key])),
);
