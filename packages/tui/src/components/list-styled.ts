import { StyledText, type TextChunk } from "@opentui/core";
import { sliceByCells } from "../domain/styling/index.ts";
import { styleChunk, type PitStyle } from "./component-style.ts";
import type { SelectListTheme } from "./select-list-types.ts";
import type { SettingsListTheme } from "./settings-list-types.ts";

export const joinStyledLines = (lines: TextChunk[][]): StyledText => {
  const chunks: TextChunk[] = [];
  lines.forEach((line, index) => {
    if (index) chunks.push({ __isChunk: true, text: "\n" });
    chunks.push(...line);
  });
  return new StyledText(chunks);
};

const tint = (style: PitStyle | undefined, bg: PitStyle["bg"]): PitStyle | undefined =>
  bg !== undefined ? { ...style, bg } : style;

export interface SelectStyledRow { line: string; labelEnd: number; selected: boolean }

/** Splits each plain rendered line into prefix/label/description chunks so roles carry their colors; the selected row gets the full-width bg tint. */
export const selectListStyled = (rows: SelectStyledRow[], scroll: string | undefined, theme: SelectListTheme, width: number): StyledText => {
  if (rows.length === 0) return joinStyledLines([[styleChunk("  No matching commands", theme.noMatch)]]);
  const lines = rows.map(({ line, labelEnd, selected }) => {
    const bg = selected ? theme.selectedText?.bg : undefined;
    return [
      styleChunk(sliceByCells(line, 0, 2), selected ? theme.selectedPrefix : theme.text),
      styleChunk(sliceByCells(line, 2, Math.max(0, labelEnd - 2)), selected ? theme.selectedText : theme.text),
      styleChunk(sliceByCells(line, labelEnd, Math.max(0, width - labelEnd)), tint(theme.description, bg)),
    ];
  });
  if (scroll !== undefined) lines.push([styleChunk(scroll, theme.scrollInfo)]);
  return joinStyledLines(lines);
};

export interface SettingsStyledRow { line: string; prefixWidth: number; labelWidth: number; selected: boolean }
export interface SettingsStyledState { rows?: SettingsStyledRow[]; scroll?: string; description?: string; hint?: string; empty?: string }

/** Splits each plain settings line into cursor/label/value chunks; the selected row gets the full-width bg tint. */
export const settingsListStyled = (state: SettingsStyledState, theme: SettingsListTheme, width: number): StyledText => {
  if (state.empty !== undefined) return joinStyledLines([[styleChunk(state.empty, theme.description)]]);
  const lines = (state.rows ?? []).map(({ line, prefixWidth, labelWidth, selected }) => {
    const bg = selected ? theme.selected?.bg : undefined;
    const labelEnd = prefixWidth + labelWidth;
    return [
      styleChunk(sliceByCells(line, 0, prefixWidth), selected ? theme.selected : theme.label),
      styleChunk(sliceByCells(line, prefixWidth, labelWidth), tint(theme.label, bg)),
      styleChunk(sliceByCells(line, labelEnd, Math.max(0, width - labelEnd)), tint(theme.value, bg)),
    ];
  });
  if (state.scroll !== undefined) lines.push([styleChunk(state.scroll, theme.hint)]);
  if (state.description !== undefined) lines.push([], [styleChunk(state.description, theme.description)]);
  if (state.hint !== undefined) lines.push([], [styleChunk(state.hint, theme.hint)]);
  return joinStyledLines(lines);
};
