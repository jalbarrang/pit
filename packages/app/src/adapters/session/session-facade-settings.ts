import type { AgentSession } from "@earendil-works/pi-coding-agent";

type QueueMode = "all" | "one-at-a-time";
type SessionLike = Pick<AgentSession, "setSteeringMode" | "setFollowUpMode" | "setAutoCompactionEnabled">;

/**
 * Applies a changed pit setting to the live AgentSession. The SDK setters
 * also persist through the session's own SettingsManager, so new sessions
 * pick the values up from settings.json without extra wiring.
 * Returns false when the setting has no live-session effect.
 */
export function applySessionSettingOf(session: SessionLike, id: string, value: string): boolean {
  switch (id) {
    case "autoCompact":
      session.setAutoCompactionEnabled(value === "true");
      return true;
    case "steeringMode":
      session.setSteeringMode(value as QueueMode);
      return true;
    case "followUpMode":
      session.setFollowUpMode(value as QueueMode);
      return true;
    default:
      return false;
  }
}
