import type { AutocompleteProvider } from "../../domain/input/index.ts";
import type { Component } from "../component.ts";
import type { SelectListTheme } from "../select-list-types.ts";

export interface EditorComponent extends Component {
  getText(): string;
  setText(text: string): void;
  handleInput(data: string): void;
  onSubmit?: (text: string) => void;
  onChange?: (text: string) => void;
  addToHistory?(text: string): void;
  insertTextAtCursor?(text: string): void;
  getExpandedText?(): string;
  setAutocompleteProvider?(provider: AutocompleteProvider): void;
  borderColor?: (str: string) => string;
  setPaddingX?(padding: number): void;
  setAutocompleteMaxVisible?(maxVisible: number): void;
}

export interface EditorTheme {
  borderColor?: (str: string) => string;
  selectList?: SelectListTheme;
  textColor?: string;
  focusedTextColor?: string;
}
export interface EditorOptions { paddingX?: number; autocompleteMaxVisible?: number; width?: number; maxHeight?: number }
