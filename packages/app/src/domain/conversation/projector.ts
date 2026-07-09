import { extractImages } from "../images/index.ts";
import { textFromContent, thinkingFromContent } from "./event-text.ts";
import { toolOutputText } from "./tool-output.ts";
import { Transcript } from "./transcript.ts";
import type { TranscriptSnapshot } from "./types.ts";

type EventLike = Record<string, any>;

export class TranscriptProjector {
  readonly transcript = new Transcript();

  project(event: EventLike): TranscriptSnapshot {
    if (event.type === "message_start") this.messageStart(event.message);
    if (event.type === "message_update") this.messageUpdate(event.assistantMessageEvent);
    if (event.type === "message_end") this.messageEnd(event.message);
    if (event.type === "tool_execution_start") this.transcript.startTool(event.toolCallId, event.toolName, event.args);
    if (event.type === "tool_execution_update") this.transcript.updateTool(event.toolCallId, toolOutputText(event.partialResult), extractImages(event.partialResult));
    if (event.type === "tool_execution_end") this.transcript.finishTool(event.toolCallId, toolOutputText(event.result), !!event.isError, extractImages(event.result));
    return this.transcript.snapshot();
  }

  private messageStart(message: EventLike | undefined): void {
    if (message?.role === "user") this.transcript.addTurn("user", textFromContent(message.content), "complete");
    if (message?.role === "assistant") this.transcript.addTurn("assistant", "", "awaiting");
  }

  private messageUpdate(update: EventLike | undefined): void {
    if (!update) return;
    if (update.type === "text_delta") this.transcript.appendAssistant(update.delta ?? "");
    if (update.type === "thinking_delta") this.transcript.appendThinking(update.delta ?? "");
    if (update.type === "text_end") this.transcript.completeAssistant(update.content ?? "");
  }

  private messageEnd(message: EventLike | undefined): void {
    if (message?.role !== "assistant") return;
    const text = textFromContent(message.content);
    const turn = this.transcript.completeAssistant(text, message.stopReason === "aborted");
    const thinking = thinkingFromContent(message.content);
    if (turn && thinking) turn.thinking = thinking;
  }
}
