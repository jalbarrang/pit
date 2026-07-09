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
