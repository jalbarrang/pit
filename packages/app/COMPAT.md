# Extension compatibility (pit ↔ pi)

pit runs pi extensions through `ExtensionUIContext` + an ANSI bridge for legacy `render(width): string[]` components.

## Works

- `select` / `confirm` / `input` — pit chrome overlays (`SelectorOverlay` / `InputOverlay`), promise-returning
- `notify` — transient chat line via shell host
- `setTitle`, `setStatus`, `setEditorText` / `getEditorText` / `pasteToEditor`
- `getToolsExpanded` / `setToolsExpanded`
- `setEditorComponent` / `getEditorComponent` — factory stored; swap when output satisfies pit `EditorComponent`
- `theme` / `getAllThemes` / `getTheme` / `setTheme` — SDK Theme object; name-based switch is best-effort
- `onTerminalInput` — listener registry (shell dispatches when wired)
- `custom` — factory result duck-typed through `AnsiBridge` when it lacks `.renderable`
- Extension loading via `DefaultResourceLoader.additionalExtensionPaths` + `AgentSession.bindExtensions({ uiContext, mode: "tui" })`

## Bridged

- Legacy pi-tui components (`render(width): string[]`) → `AnsiBridge` → SGR parser → opentui `StyledText` chunks
- `string[]` widget content → static bridged lines
- Native `@pit/tui` components with `.renderable` pass through unchanged

## Unsupported / deferred

- Full `setHeader` / `setFooter` / `setWidget` factory mounting into the live chat chrome layout (APIs accept/store; visual mount is stubbed)
- `setWorkingMessage` / `setWorkingVisible` / `setWorkingIndicator` / `setHiddenThinkingLabel` — no-ops until streaming chrome owns them
- `addAutocompleteProvider` — no-op
- `editor()` multiline overlay — currently reuses single-line `input()`
- Deep pi-tui internals (direct `TUI` layout APIs, pi-tui-only Component subclasses that are not duck-typed)
- Dialog countdown UI for `timeout` (timeout still auto-dismisses; no live countdown text)
- Extensions that import `@earendil-works/pi-tui` and expect string-mode parent containers

## Live gate

Fixture: `packages/app/src/adapters/extensions/fixtures/pit-confirm.ts` (same confirm/notify pattern as pi-mono `examples/extensions/timed-confirm.ts`).

`live-gate.test.ts` loads it through `AppSession.createWithExtensions`, binds `PitExtensionUIContext`, runs `/pit-confirm`, asserts `gate:yes`.
