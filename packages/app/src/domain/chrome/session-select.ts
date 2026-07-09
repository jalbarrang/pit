import type { SelectItem } from "@pit/tui";
import type { SessionSummary } from "../ports.ts";

const MAX_LABEL = 60;

export const formatAge = (modified: Date, now: Date): string => {
  const seconds = Math.max(0, (now.getTime() - modified.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
};

const label = (session: SessionSummary): string => {
  const text = (session.name ?? session.firstMessage ?? "").trim() || session.id;
  return text.length > MAX_LABEL ? `${text.slice(0, MAX_LABEL)}…` : text;
};

export const sessionSelectItems = (sessions: SessionSummary[], currentPath: string | undefined, now: Date): { items: SelectItem[]; initialIndex: number } => {
  const sorted = [...sessions].sort((a, b) => b.modified.getTime() - a.modified.getTime());
  const items = sorted.map((session) => ({
    value: session.path,
    label: label(session),
    description: `${session.messageCount} msgs · ${formatAge(session.modified, now)}${session.path === currentPath ? " · current" : ""}`,
  }));
  const initialIndex = Math.max(0, items.findIndex((item) => item.value === currentPath));
  return { items, initialIndex };
};
