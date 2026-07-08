export type ParsedModifyOtherKeys = { codepoint: number; modifier: number };

export const parseModifyOtherKeys = (data: string): ParsedModifyOtherKeys | null => {
  const match = data.match(/^\x1b\[27;(\d+);(\d+)~$/);
  if (!match) return null;
  return { modifier: Number(match[1]) - 1, codepoint: Number(match[2]) };
};

export const matchesModifyOtherKeys = (data: string, codepoint: number, modifier: number): boolean => {
  const parsed = parseModifyOtherKeys(data);
  return !!parsed && parsed.codepoint === codepoint && parsed.modifier === modifier;
};
