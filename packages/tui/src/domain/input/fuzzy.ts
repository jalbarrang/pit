export interface FuzzyMatch { matches: boolean; score: number }

export function fuzzyMatch(query: string, text: string): FuzzyMatch {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matchQuery = (q: string): FuzzyMatch => {
    if (q.length === 0) return { matches: true, score: 0 };
    if (q.length > textLower.length) return { matches: false, score: 0 };
    let queryIndex = 0;
    let score = 0;
    let last = -1;
    let run = 0;
    for (let i = 0; i < textLower.length && queryIndex < q.length; i++) {
      if (textLower[i] !== q[queryIndex]) continue;
      const boundary = i === 0 || /[\s\-_./:]/.test(textLower[i - 1]!);
      if (last === i - 1) score -= ++run * 5;
      else {
        run = 0;
        if (last >= 0) score += (i - last - 1) * 2;
      }
      if (boundary) score -= 10;
      score += i * 0.1;
      last = i;
      queryIndex++;
    }
    if (queryIndex < q.length) return { matches: false, score: 0 };
    return { matches: true, score: q === textLower ? score - 100 : score };
  };
  const primary = matchQuery(queryLower);
  if (primary.matches) return primary;
  const alphaNumeric = queryLower.match(/^(?<letters>[a-z]+)(?<digits>[0-9]+)$/);
  const numericAlpha = queryLower.match(/^(?<digits>[0-9]+)(?<letters>[a-z]+)$/);
  const swapped = alphaNumeric ? `${alphaNumeric.groups?.digits}${alphaNumeric.groups?.letters}` : numericAlpha ? `${numericAlpha.groups?.letters}${numericAlpha.groups?.digits}` : "";
  const swappedMatch = swapped ? matchQuery(swapped) : primary;
  return swappedMatch.matches ? { matches: true, score: swappedMatch.score + 5 } : primary;
}

export function fuzzyFilter<T>(items: T[], query: string, getText: (item: T) => string): T[] {
  const tokens = query.trim().split(/[\s/]+/).filter(Boolean);
  if (tokens.length === 0) return items;
  const results: { item: T; totalScore: number }[] = [];
  for (const item of items) {
    let totalScore = 0;
    let ok = true;
    for (const token of tokens) {
      const match = fuzzyMatch(token, getText(item));
      if (!match.matches) { ok = false; break; }
      totalScore += match.score;
    }
    if (ok) results.push({ item, totalScore });
  }
  return results.sort((a, b) => a.totalScore - b.totalScore).map((result) => result.item);
}
