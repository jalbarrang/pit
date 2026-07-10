import type { AgentSessionEvent } from "@earendil-works/pi-coding-agent";
import { AssistantMessageComponent, StatusIndicator, ThinkingComponent, ToolExecutionComponent, UserMessageComponent } from "../components/index.ts";
import type { SessionGateway } from "../domain/index.ts";
import { createTheme } from "../domain/theming/index.ts";
import type { ChatShell } from "../adapters/shell/index.ts";
import { imagesFromResult, textFromContent, textFromResult, thinkingFromContent } from "./chat-parts.ts";

type MessageEvent = AgentSessionEvent & { message?: any; assistantMessageEvent?: any };
type ChatUi = { Thinking?: typeof ThinkingComponent; Assistant?: typeof AssistantMessageComponent };

export class ChatController {
  private assistant?: AssistantMessageComponent;
  private thinking?: ThinkingComponent;
  private status?: StatusIndicator;
  private readonly tools = new Map<string, ToolExecutionComponent>();
  private readonly theme = createTheme("dark");
  private unsubscribe?: () => void;
  private readonly shell: ChatShell;
  private readonly session: SessionGateway<AgentSessionEvent>;
  private readonly ui: ChatUi;

  constructor(shell: ChatShell, session: SessionGateway<AgentSessionEvent>, ui: ChatUi = {}) {
    this.shell = shell; this.session = session; this.ui = ui;
  }

  start(): void { this.unsubscribe = this.session.subscribe((event) => this.onEvent(event as MessageEvent)); }
  stop(): void { this.unsubscribe?.(); }

  private onEvent(event: MessageEvent): void {
    this.shell.refreshFooter();
    if (event.type === "message_start" && event.message?.role === "user") this.addUser(event.message.content);
    if (event.type === "message_start" && event.message?.role === "assistant") this.addAssistant();
    if (event.type === "message_update") this.updateAssistant(event.assistantMessageEvent);
    if (event.type === "message_end" && event.message?.role === "assistant") this.finishAssistant(event.message.content);
    if (event.type === "tool_execution_start") this.startTool(event);
    if (event.type === "tool_execution_update") this.updateTool(event, "running");
    if (event.type === "tool_execution_end") this.updateTool(event, event.isError ? "failed" : "succeeded");
  }

  private addUser(content: unknown): void {
    this.shell.chat.addMessage(new UserMessageComponent(this.shell.tui.ctx, textFromContent(content), this.theme));
  }

  private addAssistant(): void {
    this.status = this.shell.extensionMount.createStatusIndicator(this.shell.tui.ctx);
    if (this.status) this.shell.chat.addMessage(this.status);
    const Thinking = this.ui.Thinking ?? ThinkingComponent;
    this.thinking = new Thinking(this.shell.tui.ctx, this.theme);
    this.shell.chat.addMessage(this.thinking);
    this.shell.registerThinking(this.thinking);
    const Assistant = this.ui.Assistant ?? AssistantMessageComponent;
    this.assistant = new Assistant(this.shell.tui.ctx, "", this.theme);
    this.shell.chat.addMessage(this.assistant);
  }

  private clearStatus(): void {
    if (this.status) this.shell.chat.removeMessage(this.status);
    this.shell.extensionMount.clearStatusIndicator(this.status);
    this.status = undefined;
  }

  private updateAssistant(update: any): void {
    if (update?.type === "thinking_delta") { this.clearStatus(); this.thinking?.appendThinking(update.delta ?? ""); return; }
    if (update?.type !== "text_delta") return;
    this.clearStatus();
    this.assistant?.append(update.delta ?? "");
  }

  private finishAssistant(content: unknown): void {
    this.clearStatus();
    const t = thinkingFromContent(content);
    if (t) this.thinking?.setThinking(t);
    this.assistant?.setText(textFromContent(content));
    this.assistant?.finalize();
  }

  private startTool(event: any): void {
    const run = { id: event.toolCallId, name: event.toolName, args: event.args, status: "running" as const, output: "" };
    const component = new ToolExecutionComponent(this.shell.tui.ctx, run, this.theme);
    this.tools.set(run.id, component);
    this.shell.registerExpandable(component);
    this.shell.chat.addMessage(component);
  }

  private updateTool(event: any, status: "running" | "succeeded" | "failed"): void {
    const component = this.tools.get(event.toolCallId);
    if (!component) return;
    const result = event.partialResult ?? event.result;
    const images = imagesFromResult(result);
    this.shell.rememberImages(images);
    component.update({ id: event.toolCallId, name: event.toolName, args: event.args, status, output: textFromResult(result), images });
  }
}
