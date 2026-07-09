import type { AutocompleteProvider } from "@pit/tui";

export const emptyAutocompleteProvider: AutocompleteProvider = {
  async getSuggestions() {
    return { items: [], prefix: "" };
  },
  applyCompletion(lines, cursorLine, cursorCol) {
    return { lines, cursorLine, cursorCol };
  },
};
