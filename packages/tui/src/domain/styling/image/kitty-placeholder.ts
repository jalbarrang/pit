import { KITTY_DIACRITICS } from "./kitty-diacritics.ts";
import type { ImageCellSize } from "./types.ts";

const APC = "\x1b_G";
const ST = "\x1b\\";
const PLACEHOLDER = String.fromCodePoint(0x10eeee);
const CHUNK = 4096;
const MAX_ID = 0xffffff;
let nextId = 1 + Math.floor(Math.random() * (MAX_ID - 1));

export type KittyImageSource =
  | { format: "png"; data: Uint8Array }
  | { format: "rgba"; widthPx: number; heightPx: number; data: Uint8Array };
export interface KittyColor { r: number; g: number; b: number; a: number }
export interface KittyTextChunk { text: string; fg: KittyColor }
export interface KittyPlaceholderRow { chunks: KittyTextChunk[] }

const sourceControls = (source: KittyImageSource): string[] => {
  if (source.format === "png") return ["a=t", "f=100"];
  // JPEG and other decoded sources use raw 32-bit RGBA because the kitty protocol
  // only accepts PNG, RGB, or RGBA; a=t stores data without a physical placement.
  return ["a=t", "f=32", `s=${source.widthPx}`, `v=${source.heightPx}`];
};

const colorForId = (id: number): KittyColor => ({ r: (id >> 16) & 255, g: (id >> 8) & 255, b: id & 255, a: 255 });
const b64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString("base64");
const escape = (controls: string[], payload = ""): string => `${APC}${controls.join(",")};${payload}${ST}`;
const diacritic = (value: number): string => {
  const mark = KITTY_DIACRITICS[value];
  if (!mark) throw new RangeError(`kitty placeholder index ${value} exceeds diacritic table`);
  return mark;
};

export const allocateKittyImageId = (): number => {
  const id = nextId;
  nextId = nextId >= MAX_ID ? 1 : nextId + 1;
  return id;
};

export const buildKittyTransmissionEscapeChunks = (source: KittyImageSource, id: number): string[] => {
  const payload = b64(source.data);
  const chunks = payload.match(new RegExp(`.{1,${CHUNK}}`, "g")) ?? [""];
  return chunks.map((chunk, index) => {
    const last = index === chunks.length - 1;
    const controls = index === 0 ? [...sourceControls(source), `i=${id}`, "q=2", `m=${last ? 0 : 1}`] : ["q=2", `m=${last ? 0 : 1}`];
    return escape(controls, chunk);
  });
};

export const buildKittyTransmissionEscapes = (source: KittyImageSource, id: number): string =>
  buildKittyTransmissionEscapeChunks(source, id).join("");

export const buildKittyPlacementEscape = (id: number, cells: ImageCellSize): string =>
  escape(["a=p", "U=1", `i=${id}`, `c=${cells.columns}`, `r=${cells.rows}`, "q=2"]);

export const buildKittyDeleteEscape = (id: number): string => escape(["a=d", "d=I", `i=${id}`, "q=2"]);

export const kittyPlaceholderRows = (id: number, cells: ImageCellSize): KittyPlaceholderRow[] => {
  if (id < 1 || id > MAX_ID) throw new RangeError("kitty placeholder ids must fit in 24-bit true color");
  const fg = colorForId(id);
  return Array.from({ length: cells.rows }, (_, row) => ({
    chunks: Array.from({ length: cells.columns }, (_, column) => ({ text: `${PLACEHOLDER}${diacritic(row)}${diacritic(column)}`, fg })),
  }));
};
