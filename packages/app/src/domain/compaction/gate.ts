export function decideSubmission(compacting: boolean): { queued: boolean; sent: boolean } {
  if (compacting) return { queued: true, sent: false };
  return { queued: false, sent: true };
}

export function gates(s: { compacting: number; queued: number; sent: number }): boolean {
  const d = decideSubmission(s.compacting === 1);
  return (d.queued ? 1 : 0) === s.queued && (d.sent ? 1 : 0) === s.sent;
}
