# Editor implementation notes

## Base renderable decision

`pit` uses a `TextRenderable`-backed editor adapter rather than `TextareaRenderable` or `EditBufferRenderable` for the first editor implementation.

Reasons:

1. `TextareaRenderable` owns `handleKeyPress()` and still inserts printable input even when `traits.suspend === true`, so it cannot be made a fully passive view for pi-compatible key handling.
2. `EditBufferRenderable` gives useful wrap, cursor, and viewport APIs, but constructing it requires opentui FFI; `pnpm test` intentionally runs without `--experimental-ffi`.
3. The required behavior is mostly domain logic: pi-compatible undo coalescing, kill ring, history, slash/file autocomplete, bracketed paste, and kitty-aware raw key sequences.
4. A `TextRenderable` can display the model's viewport and fake cursor in tests without FFI, while real TTY demos still render through opentui.

## Internal key handling

No opentui editor key handler is registered. `Editor.handleInput(data)` owns all raw input, resolves it with `KeybindingsManager`/`matchesKey`, mutates the pure `EditorModel`, then refreshes the text renderable.

## TextModel adapter surface

The adapter between the component and domain model is:

- `getText(): string`
- `setText(text: string): void`
- `insertTextAtCursor(text: string): void`
- `deleteRange(start, end): void` through model editing operations
- `cursorOffset(): number`
- `setCursor(offset): void`
- `getCursor(): { line: number; col: number }`

## EditorComponent compatibility members

Required members from `pi-tui/src/editor-component.ts`:

- `getText()` — implemented by `EditorModel.getText()`.
- `setText(text)` — implemented, normalizes CRLF and moves cursor to end.
- `handleInput(data)` — implemented, raw-sequence owned.
- `onSubmit?: (text) => void` — implemented; Enter submits trimmed expanded text and clears editor.
- `onChange?: (text) => void` — implemented; fired after text mutations.

Optional members:

- `addToHistory?(text)` — implemented with 100-entry prompt history.
- `insertTextAtCursor?(text)` — implemented as one undo unit.
- `getExpandedText?()` — implemented; currently equals `getText()` because large paste text is inserted directly instead of rendered as pi paste markers.
- `setAutocompleteProvider?(provider)` — implemented.
- `borderColor?: (str) => string` — exposed and used for border rendering text.
- `setPaddingX?(padding)` — implemented.
- `setAutocompleteMaxVisible?(maxVisible)` — implemented.

Planned view-only behavior: popup placement is computed by the component adapter; the domain autocomplete provider remains independent of opentui.
