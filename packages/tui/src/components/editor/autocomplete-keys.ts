import type { EditorAutocomplete } from "./autocomplete-popup.ts";

/** Editor surface the autocomplete key router needs (keeps editor.ts thin). */
export interface AutocompleteHost {
  autocomplete(): EditorAutocomplete;
  update(): void;
  accept(): boolean;
  request(force: boolean): void;
}

/**
 * Route a key while the autocomplete popup may be open.
 * Returns true if the key was fully consumed. Enter on a slash-command
 * completion accepts it and returns false so the caller falls through to
 * submit (running the command); file/@ completions accept only.
 */
export function routeAutocompleteKey(host: AutocompleteHost, key: string, data: string): boolean {
  const popup = host.autocomplete();
  if (popup.active) {
    if (key === "escape") { popup.dismiss(); host.update(); return true; }
    if (key === "up" || key === "down") { popup.move(data); host.update(); return true; }
    if (key === "tab") return host.accept();
    if (key === "submit") {
      const isCommand = popup.currentPrefix().startsWith("/");
      const accepted = host.accept();
      return isCommand && accepted ? false : accepted;
    }
  }
  if (key === "tab") { host.request(true); return true; }
  return false;
}
