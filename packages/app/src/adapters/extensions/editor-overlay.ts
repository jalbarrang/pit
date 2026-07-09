import { BoxRenderable } from "@opentui/core";
import { Container, Editor, Text, type TUI } from "@pit/tui";

export function openEditorOverlay(tui: TUI, title: string, prefill = ""): Promise<string | undefined> {
  return new Promise((resolve) => {
    const box = new Container(tui.ctx, new BoxRenderable(tui.ctx, { flexDirection: "column", width: "80%", height: "auto", border: true }));
    const label = new Text(tui.ctx, title, 1, 0);
    const editor = new Editor(tui.ctx, {}, { maxHeight: 12, width: Math.max(20, Math.floor(tui.renderer.width * 0.75)) });
    box.addChild(label);
    box.addChild(editor);
    editor.setText(prefill);
    const handle = tui.showOverlay(box, { anchor: "center", width: "80%" });
    editor.onSubmit = (text) => { handle.hide(); resolve(text); };
    tui.setFocus(editor);
  });
}
