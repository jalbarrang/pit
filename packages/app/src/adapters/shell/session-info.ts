import type { SessionGateway } from "../../domain/index.ts";

export interface SessionInfoHost {
  session(): SessionGateway | undefined;
  notify(text: string): void;
  refreshFooter(): void;
  copyToClipboard(text: string): boolean;
  noticeCopied(): void;
}

export class SessionInfoSelectors {
  private readonly host: SessionInfoHost;
  constructor(host: SessionInfoHost) { this.host = host; }

  renameSession(args: string): void {
    const name = args.trim();
    const s = this.host.session();
    if (!name) return this.host.notify(`Session: ${s?.sessionName?.() ?? "(unnamed)"}`);
    if (!s?.setSessionName) return this.host.notify("Naming unavailable");
    s.setSessionName(name);
    this.host.refreshFooter();
    this.host.notify(`Session named: ${name}`);
  }

  showSessionStats(): void {
    const st = this.host.session()?.sessionStats?.();
    if (!st) return this.host.notify("Session stats unavailable");
    const lines = [
      ...(st.file ? [st.file] : []),
      st.id,
      `messages: ${st.userMessages} user / ${st.assistantMessages} assistant`,
      `tools: ${st.toolCalls}`,
      `tokens: ${st.totalTokens}`,
      ...(st.cost != null ? [`cost: $${Number(st.cost.toFixed(4))}`] : []),
    ];
    this.host.notify(lines.join("\n"));
  }

  copyLastAssistant(): void {
    const text = this.host.session()?.lastAssistantText?.();
    if (!text) return this.host.notify("Nothing to copy");
    if (this.host.copyToClipboard(text)) this.host.noticeCopied();
    else this.host.notify("Clipboard unavailable — terminal has no OSC52");
  }
}
