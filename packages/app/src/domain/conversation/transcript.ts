import type { ToolRun, TranscriptSnapshot, Turn, TurnRole } from "./types.ts";

export class Transcript {
  private readonly turns: Turn[] = [];
  private readonly tools: ToolRun[] = [];

  addTurn(role: TurnRole, text = "", streaming: Turn["streaming"] = "idle"): Turn {
    const turn = { id: `${role}-${this.turns.length + 1}`, role, text, streaming };
    this.turns.push(turn);
    return turn;
  }

  currentAssistant(): Turn | undefined {
    return [...this.turns].reverse().find((turn) => turn.role === "assistant");
  }

  appendAssistant(delta: string): Turn {
    const turn = this.currentAssistant() ?? this.addTurn("assistant", "", "streaming");
    turn.text += delta;
    turn.streaming = "streaming";
    return turn;
  }

  appendThinking(delta: string): Turn {
    const turn = this.currentAssistant() ?? this.addTurn("assistant", "", "streaming");
    turn.thinking = `${turn.thinking ?? ""}${delta}`;
    return turn;
  }

  completeAssistant(text?: string, aborted = false): Turn | undefined {
    const turn = this.currentAssistant();
    if (!turn) return undefined;
    if (text !== undefined) turn.text = text;
    turn.streaming = aborted ? "aborted" : "complete";
    return turn;
  }

  startTool(id: string, name: string, args: unknown): ToolRun {
    const tool = { id, name, args, status: "running" as const, output: "" };
    this.tools.push(tool);
    return tool;
  }

  updateTool(id: string, output: string, images: ToolRun["images"] = []): ToolRun | undefined {
    const tool = this.tools.find((candidate) => candidate.id === id);
    if (tool) { tool.output = output; tool.images = images; }
    return tool;
  }

  finishTool(id: string, output: string, isError: boolean, images: ToolRun["images"] = []): ToolRun | undefined {
    const tool = this.updateTool(id, output, images);
    if (tool) tool.status = isError ? "failed" : "succeeded";
    return tool;
  }

  snapshot(): TranscriptSnapshot {
    return { turns: this.turns.map((turn) => ({ ...turn })), tools: this.tools.map((tool) => ({ ...tool })) };
  }
}
