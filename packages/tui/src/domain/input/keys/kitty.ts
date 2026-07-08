import { ARROW, FN } from "./codepoints.ts";
export type KeyEventType = "press" | "repeat" | "release";
export type ParsedKitty = { codepoint: number; baseLayoutKey?: number; shiftedKey?: number; modifier: number; eventType: KeyEventType };

const eventType = (value?: string): KeyEventType => value === "2" ? "repeat" : value === "3" ? "release" : "press";

export const parseKittySequence = (data: string): ParsedKitty | null => {
  const csi = data.match(/^\x1b\[(\d+)(?::(\d*))?(?::(\d+))?(?:;(\d+))?(?::(\d+))?u$/);
  if (csi) return {
    codepoint: Number(csi[1]),
    shiftedKey: csi[2] ? Number(csi[2]) : undefined,
    baseLayoutKey: csi[3] ? Number(csi[3]) : undefined,
    modifier: (csi[4] ? Number(csi[4]) : 1) - 1,
    eventType: eventType(csi[5]),
  };
  const arrow = data.match(/^\x1b\[1;(\d+)(?::(\d+))?([ABCD])$/);
  if (arrow) {
    const map: Record<string, number> = { A: ARROW.up, B: ARROW.down, C: ARROW.right, D: ARROW.left };
    return { codepoint: map[arrow[3]!]!, modifier: Number(arrow[1]) - 1, eventType: eventType(arrow[2]) };
  }
  const func = data.match(/^\x1b\[(\d+)(?:;(\d+))?(?::(\d+))?~$/);
  if (func) {
    const map = new Map([[2, FN.insert], [3, FN.delete], [5, FN.pageUp], [6, FN.pageDown], [7, FN.home], [8, FN.end]]);
    const codepoint = map.get(Number(func[1]));
    return codepoint === undefined ? null : { codepoint, modifier: (func[2] ? Number(func[2]) : 1) - 1, eventType: eventType(func[3]) };
  }
  const homeEnd = data.match(/^\x1b\[1;(\d+)(?::(\d+))?([HF])$/);
  if (!homeEnd) return null;
  return { codepoint: homeEnd[3] === "H" ? FN.home : FN.end, modifier: Number(homeEnd[1]) - 1, eventType: eventType(homeEnd[2]) };
};

export const isKeyRelease = (data: string): boolean => !data.includes("\x1b[200~") && /:3[u~ABCDFH]/.test(data);
export const isKeyRepeat = (data: string): boolean => !data.includes("\x1b[200~") && /:2[u~ABCDFH]/.test(data);
