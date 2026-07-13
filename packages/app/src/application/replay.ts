import { AssistantMessageComponent, UserMessageComponent } from "../components/index.ts";
import type { SessionGateway } from "../domain/index.ts";
import type { ChatShell } from "../adapters/shell/index.ts";

/** Rebuilds the chat transcript from a resumed session's message history. */
export const replaySession = (shell: ChatShell, session: SessionGateway, theme = shell.currentTheme()): void => {
  shell.chat.clear();
  for (const message of session.history?.() ?? []) {
    if (message.role === "user") {
      shell.chat.addMessage(new UserMessageComponent(shell.tui.ctx, message.text, theme));
    } else {
      const component = new AssistantMessageComponent(shell.tui.ctx, message.text, theme);
      component.finalize();
      shell.chat.addMessage(component);
    }
  }
};
