import type { AgentSessionEvent } from "@earendil-works/pi-coding-agent";
import { AssistantMessageComponent, StatusIndicator, ToolExecutionComponent, UserMessageComponent } from "../components/index.ts";
import type { SessionGateway } from "../domain/index.ts";
import { createTheme } from "../domain/theming/index.ts";
import type { ChatShell } from "../adapters/shell/index.ts";

type MessageEvent = AgentSessionEvent & { message?: any; assistantMessageEvent?: any };

export class ChatController {
  private assistant?: AssistantMessageComponent;
  private status?: StatusIndicator;
  private readonly tools = new Map<string, ToolExecutionComponent>();
  private readonly theme = createTheme("dark");
  private unsubscribe?: () => void;
  private readonly shell: ChatShell;
  private readonly session: SessionGateway<AgentSessionEvent>;

  constructor(shell: ChatShell, session: SessionGateway<AgentSessionEvent>) {
    this.shell = shell;
    this.session = session;
  }

  start(): void {
    this.unsubscribe = this.session.subscribe((event) => this.onEvent(event as MessageEvent));
  }

  stop(): void {
    this.unsubscribe?.();
  }

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
    this.assistant = new AssistantMessageComponent(this.shell.tui.ctx, "", this.theme);
    this.shell.chat.addMessage(this.assistant);
  }

  private updateAssistant(update: any): void {
    if (update?.type !== "text_delta") return;
    if (this.status) this.shell.chat.removeMessage(this.status);
    this.shell.extensionMount.clearStatusIndicator(this.status);
    this.status = undefined;
    this.assistant?.append(update.delta ?? "");
  }

  private finishAssistant(content: unknown): void {
    if (this.status) this.shell.chat.removeMessage(this.status);
    this.shell.extensionMount.clearStatusIndicator(this.status);
    this.status = undefined;
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
    component.update({ id: event.toolCallId, name: event.toolName, args: event.args, status, output: textFromResult(result) });
  }
}

const textFromContent = (content: any): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((part) => part.type === "text").map((part) => part.text ?? "").join("");
};

const textFromResult = (result: any): string => {
  const text = textFromContent(result?.content);
  if (text) return text;
  if (result?.details === undefined) return "";
  return typeof result.details === "string" ? result.details : JSON.stringify(result.details, null, 2);
};
