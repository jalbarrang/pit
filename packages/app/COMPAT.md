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

OpenTUI 0.4.3 has no region-safe Kitty/iTerm2 graphics passthrough for content inside the native cell-buffer frame, so pit does not emit raw graphics escapes. pit decodes PNG/JPEG bytes with pure-JS decoders, sizes them with pi-tui-compatible cell math, and renders inline through `FrameBufferRenderable` + `OptimizedBuffer.drawSuperSampleBuffer` quadrant rasterization. Unsupported formats or corrupt image data fall back to the bordered placeholder with filename/MIME/dimensions, and `Ctrl-Y` still opens the latest image externally through the macOS `open` adapter.

## Mouse / clipboard decision

OpenTUI 0.4.3 exposes renderable mouse handlers (`onMouseDown`, drag/scroll variants) and renderer `useMouse`; pit enables mouse input, focuses the editor on editor click, and toggles a tool box on tool-box click. Text selection and OSC52 clipboard support exist as renderer-level primitives (`startSelection`, `updateSelection`, `copyToClipboardOSC52`), but drag-select plus copy across pit's mixed ScrollBox/message tree needs ownership and selection-container wiring; it is deferred.

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
