import type { EditorState, VisualLine } from "./types.ts";

export function visualLines(state: EditorState, width: number): VisualLine[] {
  const out: VisualLine[] = [];
  const w = Math.max(1, width);
  for (let line = 0; line < state.lines.length; line++) {
    const text = state.lines[line] ?? "";
    if (text.length === 0) out.push({ line, start: 0, length: 0 });
    else for (let start = 0; start < text.length; start += w) out.push({ line, start, length: Math.min(w, text.length - start) });
  }
  return out;
}

export function visualIndex(lines: VisualLine[], line: number, col: number): number {
  for (let i = 0; i < lines.length; i++) {
    const vl = lines[i]!;
    if (vl.line !== line) continue;
    const last = i === lines.length - 1 || lines[i + 1]?.line !== line;
    const rel = col - vl.start;
    if (rel >= 0 && (rel < vl.length || (last && rel <= vl.length))) return i;
  }
  return Math.max(0, lines.length - 1);
}
