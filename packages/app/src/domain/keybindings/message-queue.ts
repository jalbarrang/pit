export interface QueuedMessages {
  steering: string[];
  followUp: string[];
}

export function combineDequeued(queued: QueuedMessages, current: string): string {
  return [...queued.steering, ...queued.followUp, current]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join("\n\n");
}

function truncate(text: string): string {
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
}

export function formatPending(queued: QueuedMessages, dequeueKey = "alt+up"): string[] {
  const lines = [
    ...queued.steering.map((text) => `Steering: ${truncate(text)}`),
    ...queued.followUp.map((text) => `Follow-up: ${truncate(text)}`),
  ];
  return lines.length ? [...lines, `↳ ${dequeueKey} to edit all queued messages`] : [];
}
