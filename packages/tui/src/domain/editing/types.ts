export interface EditorCursor { line: number; col: number }
export interface EditorState { lines: string[]; cursor: EditorCursor }
export interface EditorSnapshot { state: EditorState; pastes?: [number, string][]; pasteCounter?: number }
export type LastAction = "kill" | "yank" | "type-word" | null;
export interface VisualLine { line: number; start: number; length: number }
export interface EditorChange { changed: boolean; submitted?: string }
