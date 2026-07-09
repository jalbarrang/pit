# opencode parity map

Principle: prefer opentui-native APIs, then opencode's production pattern, then a documented fallback.

## Feature map

| pi-tui feature | Source | pit approach | Grounding |
|---|---|---|---|
| Inline images (Kitty/iTerm2 raw bytes) | `pi-mono/packages/tui/src/terminal-image.ts#renderImage`, `components/image.ts#Image` | Use opentui cell rasterization, not raw graphics passthrough; decode bytes to RGBA, size to cells, draw into `FrameBufferRenderable`; fallback only on decode/unsupported data. | `packages/tui/node_modules/@opentui/core/renderables/FrameBuffer.d.ts#FrameBufferRenderable`; `buffer.d.ts#OptimizedBuffer.drawSuperSampleBuffer`; `opencode/packages/tui/src/component/bg-pulse.tsx#GoUpsellArtRenderable`; `component/bg-pulse-render.ts#GoUpsellArtPainter.render` |
| Image sizing/dimensions | `pi-mono/packages/tui/src/terminal-image.ts#calculateImageCellSize`, `#getPngDimensions`, `#getJpegDimensions`, `#getGifDimensions`, `#getWebpDimensions` | Port sizing math into pure `@pit/tui` styling domain; decoder owns real dimensions for PNG/JPEG. | `packages/tui/src/domain/styling/image/*`; `pi-mono/packages/tui/src/terminal-image.ts#calculateImageRows` |
| Hyperlinks (OSC 8) | `pi-mono/packages/tui/src/terminal-image.ts#hyperlink`, `detectCapabilities` | Fallback to markdown/plain URL text unless opentui linkification is explicitly sufficient for content; do not emit OSC 8 into renderables. | `packages/tui/node_modules/@opentui/core/lib/detect-links.d.ts#detectLinks`; `renderables/Markdown.d.ts#MarkdownRenderable`; `packages/tui/src/components/markdown/create-renderables.ts` |
| Kitty keyboard / modified keys | `pi-mono/packages/tui/src/keys.ts#parseKey`, `terminal.ts#queryAndEnableKittyProtocol` | opentui-native keyboard parser/renderer config. | `packages/tui/node_modules/@opentui/core/renderer.d.ts#KittyKeyboardOptions`; `#CliRendererConfig.useKittyKeyboard`; `lib/parse.keypress-kitty.d.ts#parseKittyKeyboard`; `opencode/packages/tui/src/app.tsx#createCliRenderer` |
| Cursor and IME marker | `pi-mono/packages/tui/src/tui.ts#CURSOR_MARKER`, `components/editor.ts#CURSOR_MARKER` | opentui-native focus/cursor renderables; keep pit editor adapter thin and do not forward APC markers as content. | `packages/tui/node_modules/@opentui/core/renderables/Input.d.ts#InputRenderable`; `renderables/Textarea.d.ts#TextareaRenderable`; `packages/tui/src/components/editor/editor.ts` |
| Differential rendering / frame ownership | `pi-mono/packages/tui/src/tui.ts` differential renderer | opentui-native renderer owns buffering, diffing, and cells. | `packages/tui/node_modules/@opentui/core/renderer.d.ts#CliRenderer`; `buffer.d.ts#OptimizedBuffer`; `Renderable.d.ts#Renderable` |
| Scrollback and stray stdout | `pi-mono/packages/tui/src/terminal.ts#write`, `tui.ts` main-screen string rendering | Spike opentui split-footer/passthrough; do not change production fullscreen without sign-off. | `packages/tui/node_modules/@opentui/core/renderer.d.ts#ScreenMode`; `#ExternalOutputMode`; `#ScrollbackSurface`; `opencode/packages/tui/src/app.tsx#createCliRenderer({ externalOutputMode: "passthrough" })` |
| Raw ANSI in content | `pi-mono/packages/tui/src/utils.ts#extractAnsiCode`, markdown ANSI output | Parse/sanitize to styled chunks before bytes reach opentui; kitty/APC payloads must be dropped. | `packages/tui/src/domain/styling/ansi/parser.ts`; `packages/tui/src/components/bridge/chunks-to-styled.ts#ansiTextToStyledText`; `packages/tui/node_modules/@opentui/core/lib/styled-text.d.ts#StyledText` |
| Mouse input and scroll | `pi-mono/packages/tui/src/tui.ts` input routing | opentui-native mouse events and ScrollBox. | `packages/tui/node_modules/@opentui/core/renderer.d.ts#CliRendererConfig.useMouse`; `#MouseEvent`; `renderables/ScrollBox.d.ts#ScrollBoxRenderable.onMouseEvent`; `opencode/packages/tui/src/app.tsx#createCliRenderer` |
| Overlays/dialogs/selectors | `pi-mono/packages/tui/src/tui.ts#showOverlay`, `components/select-list.ts`, `settings-list.ts` | pit/opentui adapters already own renderable overlays and selectors. | `packages/tui/src/domain/composition/overlay-layout.ts`; `packages/tui/src/tui/overlays.ts`; `packages/app/src/components/chrome/selector-overlay.ts` |
| Markdown/code/table rendering | `pi-mono/packages/tui/src/components/markdown.ts#Markdown` | opentui-native `MarkdownRenderable` + custom code renderers; sanitize raw escapes before markdown when needed. | `packages/tui/node_modules/@opentui/core/renderables/Markdown.d.ts#MarkdownRenderable`; `#createMarkdownCodeBlockRenderer`; `packages/tui/src/components/markdown/markdown.ts` |
| Paste and stdin responses | `pi-mono/packages/tui/src/stdin-buffer.ts`, `terminal.ts#setupStdinBuffer` | opentui-native stdin parser and paste event path; pit editor keeps domain paste markers. | `packages/tui/node_modules/@opentui/core/lib/stdin-parser.d.ts#StdinParser`; `#StdinEvent`; `packages/tui/src/domain/editing/paste-markers.ts` |

## Decoder choice

Pending t-002 spike. Candidate constraint: pure JS only, no native postinstall. `upng-js` + `jpeg-js` is favored over `jimp` if it keeps the runtime surface small and licensing simple.

## Split-footer/passthrough spike

Pending t-004. Production remains fullscreen ScrollBox until the spike shows scrollback/copy benefits outweigh layout regressions.
