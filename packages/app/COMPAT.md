# Extension compatibility (pit ↔ pi)

pit runs pi extensions through `ExtensionUIContext` + an ANSI bridge for legacy `render(width): string[]` components.

## Works

- `select` / `confirm` / `input` — pit chrome overlays (`SelectorOverlay` / `InputOverlay`), promise-returning
- `notify` — transient chat line via shell host
- `setTitle`, `setStatus`, `setEditorText` / `getEditorText` / `pasteToEditor`
- `getToolsExpanded` / `setToolsExpanded`
- `setEditorComponent` / `getEditorComponent` — factory stored; swap when output satisfies pit `EditorComponent`
- `setHeader` / `setFooter` / `setWidget` — live chrome slots with dispose-on-replace lifecycle
- `setWorkingMessage` / `setWorkingVisible` — controls the chat status indicator label/visibility
- `editor()` — multiline editor overlay backed by `@pit/tui` `Editor`
- `theme` / `getAllThemes` / `getTheme` / `setTheme` — SDK Theme object; name-based switch is best-effort
- `onTerminalInput` — listener registry (shell dispatches when wired)
- `custom` — factory result duck-typed through `AnsiBridge` when it lacks `.renderable`
- Extension loading via `DefaultResourceLoader.additionalExtensionPaths` + `AgentSession.bindExtensions({ uiContext, mode: "tui" })`

## Bridged

- Legacy pi-tui components (`render(width): string[]`) → `AnsiBridge` → SGR parser → opentui `StyledText` chunks
- `string[]` widget content → static bridged lines
- Native `@pit/tui` components with `.renderable` pass through unchanged

## Image support decision

On terminals where OpenTUI reports `TerminalCapabilities.kitty_graphics`, pit transmits PNG bytes (or JPEG/GIF/lossless WebP decoded to raw RGBA) with quiet kitty graphics escapes, creates a virtual Unicode placement, and renders U+10EEEE placeholder cells with truecolor image-ID foregrounds so images scroll/diff with normal text. Terminals without kitty graphics capability use the pure-JS PNG/JPEG/GIF/lossless WebP decoder plus `FrameBufferRenderable` + `OptimizedBuffer.drawSuperSampleBuffer` quadrant rasterization. GIF rendering decodes the first frame only; unsupported WebP variants, unsupported formats, or corrupt image data fall back to the bordered placeholder with filename/MIME/dimensions, and `Ctrl-Y` still opens the latest image externally through the macOS `open` adapter.

## Mouse / clipboard decision

OpenTUI 0.4.3 exposes renderable mouse handlers (`onMouseDown`, drag/scroll variants) and renderer `useMouse`; pit enables mouse input, focuses the editor on editor click, and toggles a tool box on tool-box click.

**Drag-select + copy (implemented).** Selecting text with a mouse drag copies it to the system clipboard on release. This is OpenTUI-native: the renderer runs the whole drag flow (start/update/finish), highlights `selectable` renderables across the ScrollBox/message tree via `objects-in-viewport` culling, and emits `CliRenderEvents.SELECTION` with a `Selection` on mouse-up; `TextRenderable` (pit's chat messages) defaults `selectable: true` and implements `getSelectedText()`. pit adds only the consumer: `bindSelectionCopy` (`adapters/shell/selection-copy.ts`) subscribes to that event, runs the pure `planCopy`/`copyNotice` domain (`domain/selection/`), calls `renderer.copyToClipboardOSC52(text)`, and shows a transient footer confirmation ("Copied N lines" / "Copied N chars") that auto-reverts after ~1.5s.

Residual limitations:
- Requires terminal OSC52 support. When absent, `copyToClipboardOSC52` returns `false` and the footer shows "Clipboard unavailable — terminal has no OSC52" (no crash, no copy).
- Only OSC52 clipboard on drag-release is wired; primary-selection / middle-click paste is not.
- Selecting while the chat is auto-scrolling (sticky-bottom during streaming) may require re-dragging.
- Interactive drag behavior is confirmed by a human TTY pass, not automated tests — FFI-free unit tests cannot drive a real mouse (same posture as the OAuth live-flow gate). The binder, footer notice, and copy decision are unit-tested with fakes.

Manual smoke (run `scripts/dev.sh`, needs an OSC52-capable terminal):
1. Drag across one message → release → paste elsewhere shows that text; footer briefly reads "Copied N chars/lines".
2. Drag across multiple chat messages → pasted text preserves reading order and line breaks.
3. On a terminal without OSC52 → footer shows "Clipboard unavailable", no crash.

## Keybindings

pit installs an app-aware `KeybindingsManager` (`getKeybindings()`) built from `{ ...TUI_KEYBINDINGS, ...APP_KEYBINDINGS }` — the full `tui.*` set (already ported 1:1 from pi-tui) plus all 41 `app.*` ids ported verbatim from `pi-mono/packages/coding-agent/src/core/keybindings.ts` (`packages/app/src/domain/keybindings/`). User overrides load from the **shared `~/.pi/agent/keybindings.json`** (same file as pi) with legacy pre-namespaced ids auto-migrated (`expandTools` → `app.tools.expand`, etc.); `/reload` re-reads the file live. `/help` is generated from the manager, listing every binding's resolved keys (or `(unbound)`).

Global shortcuts route through the pure `resolveGlobalAction` (`domain/keybindings/global-actions.ts`), dispatched by the `routeGlobalInput` adapter (`adapters/shell/global-input.ts`). Implemented: `app.interrupt` (escape) aborts a stream; `app.tools.expand` (ctrl+o) toggles tool output; PageUp/PageDown scroll chat; `app.model.cycleForward`/`cycleBackward` (ctrl+p / shift+ctrl+p) cycle the model; `app.thinking.cycle` (shift+tab) cycles the thinking level; `app.suspend` (ctrl+z, non-Windows) suspends to background via OpenTUI `renderer.suspend()`/`resume()` around SIGTSTP/SIGCONT; `app.editor.external` (ctrl+g) opens the editor buffer in `$VISUAL`/`$EDITOR` (nano/notepad fallback) and reads it back; `app.clipboard.pasteImage` (ctrl+v; alt+v on Windows) reads an image from the clipboard (macOS only, via `osascript` «class PNGf») and attaches it to the next prompt. Suspend, external-editor, and paste-image round-trips are human-verified (TTY/clipboard), not automated.

Message queue: `app.message.followUp` (alt+enter) queues the editor text as a follow-up while streaming (SDK-owned queue via `prompt(text, { streamingBehavior: "followUp" })`); while idle it submits normally. Queued messages show as muted `Steering:`/`Follow-up:` lines above the editor. `app.message.dequeue` (alt+up) drains the SDK queue (`clearQueue`) and restores steering-then-follow-up joined by blank lines ahead of the current editor text. **Divergence removed**: alt+enter no longer inserts a newline in pit — upstream parity; newline remains shift+enter / ctrl+j. `app.model.select` (ctrl+l) opens the model selector (same as `/model`).

Thinking blocks: assistant thinking/reasoning renders in the transcript above the message text — collapsed by default to a muted "Thinking…" line (nothing shown for turns without thinking); `app.thinking.toggle` (ctrl+t) expands/collapses ALL thinking blocks globally, matching upstream's global hide/show. **Divergence removed**: the editor's ctrl+t transpose mapping was dropped (upstream has no transpose binding). Visibility is not persisted across restarts (matches pit's tools-expand behavior; upstream persists it in settings).

Scoped models: `/scoped-models` opens a multi-mark selector (enter toggles the highlighted model; `ctrl+a`/`ctrl+x` enable/clear the search-filtered set; `ctrl+p` toggles the highlighted model's provider; `alt+up`/`alt+down` reorder — order controls cycling; `ctrl+s` persists to settings `enabledModels`; esc clears search then closes, keeping the live session scope). Changes apply live via the SDK `setScopedModels`; main-chat `ctrl+p` cycling now delegates to the SDK `cycleModel`, which honors the scoped order (falls back to pit's flat cycle for gateways without it).

Session tree: `/tree` opens the tree navigator — fold/unfold branch segments (`ctrl+left`/`ctrl+right` or `alt+left`/`alt+right`), filters (`ctrl+d` default, `ctrl+t` no-tools, `ctrl+u` user-only, `ctrl+l` labeled-only, `ctrl+a` all, `ctrl+o`/`shift+ctrl+o` cycle — filter changes reset folding), `shift+l` edits the selected node's label, `shift+t` toggles label timestamps, typing searches, enter navigates the live session to that node (SDK `navigateTree` — same file, in-memory context follows; the transcript replays and a user-message target's text is restored into the editor for re-editing), esc clears search then closes. `/fork` forks via `SessionManager.forkFrom` and switches to the new session file. Deferred: branch summaries (`branchWithSummary` / summarize-on-navigate prompts) are not ported — plain navigation only.

Image attachment: pit's `SessionGateway.prompt` gained an `images?: ImagePart[]` option, threaded through `session-facade` → SDK `AgentSession.prompt({ images })` by the pure `toImageContent` mapper (`domain/images/`, `ImagePart` → pi-ai `ImageContent`). Pasted images buffer in `PendingImages` and flush on the next send; they are also remembered so `ctrl+y` can open them. On non-macOS, ctrl+v shows "Paste image not supported on this platform"; with no image on the clipboard, "No image in clipboard".

Divergences / notes:
- **ctrl+c / ctrl+d**: pit keeps its existing double-`ctrl+c` → exit; it ADDS upstream's `app.exit` = `ctrl+d` → exit **when the editor is empty**. `app.clear` (upstream ctrl+c = clear editor) is defined-but-inert to avoid breaking pit's exit UX. Whether a focused editor swallows `ctrl+d` (deleteCharForward) before the global handler sees it is key-routing-order dependent — verify on a real TTY.
- **ctrl+y**: stays pit's global open-last-image when the editor is unfocused; editor-focused `ctrl+y` remains `tui.editor.yank`.
- **Defined-but-inert** (registry + `/help` only): `app.session.*` picker-internal keys (togglePath/toggleSort/toggleNamedFilter/rename/delete/deleteNoninvasive — upstream binds these inside its /resume picker; pit's session picker does not yet support them). `app.session.new/tree/fork/resume` are unbound by default upstream too and reachable via slash commands (/tree, /fork, /resume), matching pit.
- **Known editor collisions** deferred to their feature plans: `alt+enter` (editor newline vs `app.message.followUp`), `ctrl+t` (editor transpose vs `app.thinking.toggle`).

## Perf snapshot

Stress fixture: `packages/app/src/perf-stress.ts`, 500 alternating user/assistant messages with markdown/tool-box text plus 20s streaming at ~60 token updates/s under a pseudo-TTY. Measured on 2026-07-09: 1,080 tokens, 1,091 frames, average frame 0.99ms, worst frame 3.00ms, RSS 162MB, `/usr/bin/time` user+sys CPU 1.52s over 20.39s (~7.5%). No hotspot fix was needed; OpenTUI's `objects-in-viewport.ts` provides viewport culling for ScrollBox child selection.

## Unsupported / deferred

- `setWorkingIndicator` visual variants / `setHiddenThinkingLabel` — accepted but only partially reflected by current streaming chrome
- `addAutocompleteProvider` — no-op
- Deep pi-tui internals (direct `TUI` layout APIs, pi-tui-only Component subclasses that are not duck-typed)
- Dialog countdown UI for `timeout` (timeout still auto-dismisses; no live countdown text)
- Extensions that import `@earendil-works/pi-tui` and expect string-mode parent containers

## Live gate

Fixture: `packages/app/src/adapters/extensions/fixtures/pit-confirm.ts` (same confirm/notify pattern as pi-mono `examples/extensions/timed-confirm.ts`).

`live-gate.test.ts` loads it through `AppSession.createWithExtensions`, binds `PitExtensionUIContext`, runs `/pit-confirm`, asserts `gate:yes`.
