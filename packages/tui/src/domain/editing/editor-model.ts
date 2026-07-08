import { KillRing, UndoStack } from "../input/index.ts";
import { backspace, deleteForward, insertText } from "./edit-ops.ts";
import { PromptHistory } from "./history-nav.ts";
import { killEnd, killStart, killWordBack, killWordForward, transpose, yankText } from "./kill-ops.ts";
import { moveHorizontal, moveLineEnd, moveLineStart, moveVertical, moveWord } from "./cursor-motion.ts";
import { cloneState, linesFromText, normalizeText, textFromState } from "./text.ts";
import type { EditorCursor, EditorState, LastAction } from "./types.ts";

export class EditorModel {
  readonly history = new PromptHistory();
  private state: EditorState = { lines: [""], cursor: { line: 0, col: 0 } };
  private undoStack = new UndoStack<EditorState>();
  private redoStack = new UndoStack<EditorState>();
  private killRing = new KillRing();
  private lastAction: LastAction = null;
  private lastYank = "";
  width = 80;

  getText(): string { return textFromState(this.state); }
  getState(): EditorState { return cloneState(this.state); }
  getLines(): string[] { return [...this.state.lines]; }
  getCursor(): EditorCursor { return { ...this.state.cursor }; }
  setText(text: string): void { this.snapshot(); this.state = { lines: linesFromText(text), cursor: { line: 0, col: 0 } }; this.end(); this.history.reset(); }
  addToHistory(text: string): void { this.history.add(text); }
  insert(text: string, atomic = false): void { if (!text) return; if (!atomic) this.typeSnapshot(text); else this.snapshot(); insertText(this.state, normalizeText(text)); this.history.reset(); }
  newline(): void { this.snapshot(); insertText(this.state, "\n"); this.lastAction = null; this.history.reset(); }
  backspace(): boolean { this.snapshot(); const changed = backspace(this.state); this.lastAction = null; this.history.reset(); return changed; }
  deleteForward(): boolean { this.snapshot(); const changed = deleteForward(this.state); this.lastAction = null; this.history.reset(); return changed; }
  left(): void { moveHorizontal(this.state, -1); this.lastAction = null; }
  right(): void { moveHorizontal(this.state, 1); this.lastAction = null; }
  up(): void { if (this.atTop() && (this.empty() || this.history.browsing || this.state.cursor.col === 0)) this.browse(-1); else moveVertical(this.state, -1, this.width); this.lastAction = null; }
  down(): void { if (this.history.browsing && this.atBottom()) this.browse(1); else moveVertical(this.state, 1, this.width); this.lastAction = null; }
  start(): void { moveLineStart(this.state); this.lastAction = null; }
  end(): void { moveLineEnd(this.state); this.lastAction = null; }
  wordLeft(): void { moveWord(this.state, -1); this.lastAction = null; }
  wordRight(): void { moveWord(this.state, 1); this.lastAction = null; }
  undo(): void { const snap = this.undoStack.pop(); if (!snap) return; this.redoStack.push(this.state); this.state = snap; this.lastAction = null; }
  redo(): void { const snap = this.redoStack.pop(); if (!snap) return; this.undoStack.push(this.state); this.state = snap; this.lastAction = null; }
  killStart(): void { this.kill(killStart, true); }
  killEnd(): void { this.kill(killEnd, false); }
  killWordBack(): void { this.kill(killWordBack, true); }
  killWordForward(): void { this.kill(killWordForward, false); }
  yank(): void { const text = this.killRing.peek(); if (!text) return; this.snapshot(); yankText(this.state, text); this.lastYank = text; this.lastAction = "yank"; }
  yankPop(): void { if (this.lastAction !== "yank" || this.killRing.length <= 1) return; this.snapshot(); this.removeLastYank(); this.killRing.rotate(); const text = this.killRing.peek()!; yankText(this.state, text); this.lastYank = text; this.lastAction = "yank"; }
  transpose(): void { this.snapshot(); if (transpose(this.state)) this.lastAction = null; }
  submit(): string { const value = this.getText().trim(); this.state = { lines: [""], cursor: { line: 0, col: 0 } }; this.undoStack.clear(); this.redoStack.clear(); this.lastAction = null; this.history.reset(); return value; }

  private kill(fn: (state: EditorState) => string, prepend: boolean): void { this.snapshot(); const wasKill = this.lastAction === "kill"; const text = fn(this.state); this.killRing.push(text, { prepend, accumulate: wasKill }); this.lastAction = text ? "kill" : null; this.history.reset(); }
  private removeLastYank(): void { if (!this.lastYank) return; for (let i = 0; i < this.lastYank.length; i++) backspace(this.state); }
  private browse(direction: -1 | 1): void { const text = this.history.browse(this.getText(), direction); if (text === null) return; this.state = { lines: linesFromText(text), cursor: { line: 0, col: 0 } }; if (direction === 1) this.end(); }
  private snapshot(): void { this.undoStack.push(this.state); this.redoStack.clear(); }
  private typeSnapshot(text: string): void { if (/\s/.test(text) || this.lastAction !== "type-word") this.snapshot(); this.lastAction = "type-word"; }
  private empty(): boolean { return this.state.lines.length === 1 && this.state.lines[0] === ""; }
  private atTop(): boolean { return this.state.cursor.line === 0; }
  private atBottom(): boolean { return this.state.cursor.line === this.state.lines.length - 1; }
}
