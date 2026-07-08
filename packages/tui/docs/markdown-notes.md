# Markdown implementation notes (opentui 0.4.3)

Source of truth: installed `@opentui/core@0.4.3` (`packages/tui/node_modules/@opentui/core/`). Checkout at `/Users/jalbarran/fun/drekki/opentui` used for understanding only.

## Rendering approach decision

**Use `MarkdownRenderable` directly** (not a custom parser + Text-row fallback).

Reasons:

1. 0.4.3 already exposes the hooks we need: `syntaxStyle` (per-node `markup.*` tokens), `streaming` + `parseMarkdownIncremental`, `renderNode` / `createMarkdownCodeBlockRenderer`, `tableOptions`, and link-aware `TextChunk`s via `detectLinks`.
2. Content updates are incremental when `streaming: true` (stable prefix tokens reused; trailing unstable window = 2). Full reparse of every delta is not required.
3. `SyntaxStyle.fromStyles` / `MarkdownRenderable` constructors need FFI, so the adapter follows the established pit pattern: `ctx` first + optional injected renderable last for FFI-free unit tests. Theme mapping stays pure domain (plain style records → no `@opentui/core` in `domain/`).

Fallback (parser + styled Text rows) is reserved only if a future gap blocks a required pi theme field; none found for the core theme contract.

## (a) Content updates — cost / incrementality

| Symbol | Role |
| --- | --- |
| `MarkdownRenderable.content` setter | Assigns `_content`, calls `updateBlocks()`, `requestRender()` |
| `MarkdownRenderable.streaming` | When true, `updateBlocks` passes `trailingUnstable = 2` into the parser |
| `parseMarkdownIncremental(newContent, prevState, trailingUnstable?)` | Reuses unchanged `token.raw` object refs; returns `ParseState` with `stableTokenCount` |
| `_stableBlockCount` / `updateBlocks` / `canUpdateInPlace` | Rebuilds only unstable trailing blocks; stable blocks update in place when possible |
| `clearCache()` / `refreshStyles()` | Force rebuild / style-only rerender without reparsing |

Implication for pit: set `streaming: true` while assistant text is growing; set `false` on finalize. Domain-layer stable-prefix caching (`streaming-doc.ts`) is still useful as a belt-and-suspenders mitigation and for FFI-free tests asserting cache hits on plain strings.

## (b) Theming hooks (0.4.3)

Required option: `syntaxStyle: SyntaxStyle`.

Build with:

- `SyntaxStyle.fromStyles(Record<string, StyleDefinitionInput>)` — preferred for pit theme mapping
- `SyntaxStyle.fromTheme(ThemeTokenStyle[])` — TextMate-scope style; not needed for markdown markup tokens
- `SyntaxStyle.create()` + `registerStyle(name, style)`

Markdown looks up styles via private `getStyle(group)` → `syntaxStyle.getStyle(group)`, falling back to the base name before the last `.` (e.g. `markup.heading.1` → `markup.heading` → `default`).

**Markup style groups used by `MarkdownRenderable`:**

| Group | Used for |
| --- | --- |
| `default` | Body text fallback |
| `markup.heading` / `markup.heading.N` | Headings (N = depth) |
| `markup.strong` / `markup.bold` | Bold |
| `markup.italic` | Italic |
| `markup.strikethrough` | Strikethrough |
| `markup.raw` / `markup.raw.inline` / `markup.raw.block` | Inline / fenced code |
| `markup.list` | List markers |
| `markup.quote` | Blockquote body (as `baseHighlight` on nested Code) |
| `markup.link` / `markup.link.label` / `markup.link.url` | Links |
| `conceal` | Hidden markers + default table/hr border color |
| `punctuation.special` | Optional punctuation (examples register it) |

Also: `fg` / `bg` / `conceal` / `concealCode` on `MarkdownOptions`. Style-only changes: mutate `syntaxStyle` then `refreshStyles()`.

**Domain API for t-002:** pure `markdownThemeToSyntaxStyles(theme, defaultTextStyle?) → Record<string, StyleDefinitionInput>` in `domain/styling/`. Adapter calls `SyntaxStyle.fromStyles(...)` only when constructing a real renderable.

## (c) Code block override

| Symbol | Role |
| --- | --- |
| `MarkdownCodeBlockRenderer` | `(token: Tokens.Code, context: RenderNodeContext) => Renderable \| undefined \| null` |
| `MarkdownCodeBlockRendererMap` | `ReadonlyMap<string, …> \| Readonly<Record<string, …>>` keyed by language |
| `createMarkdownCodeBlockRenderer(map)` | Returns `MarkdownOptions["renderNode"]` that dispatches on `token.type === "code"` |
| Default path | `CodeRenderable` with `filetype` from fence info string + same `syntaxStyle` + tree-sitter |

Default `CodeRenderable` already highlights known languages. Override map is for custom chrome (language header, borders matching pi `codeBlock` / `codeBlockBorder`) or unknown-lang plain fallbacks.

Tree-sitter (via `TreeSitterClient` / default parsers): `javascript`/`js`, `typescript`/`ts`, `tsx`, `python`, `go`, `rust`, `bash`/`shell`, `json`, `diff`, plus others. Unknown filetype → unstyled / base highlight, no crash.

## (d) Table styles

`MarkdownOptions.tableOptions?: MarkdownTableOptions`:

- `style?: "grid" \| "columns"` (default `"columns"` in `internalBlockMode: "top-level"`, else `"grid"`)
- `widthMode?: "content" \| "full"`
- `columnFitter`, `wrapMode`, `cellPadding` / `X` / `Y`
- `borders`, `outerBorder`, `borderStyle`, `borderColor` (defaults to `conceal` fg)
- `selectable`

pi-tui has no separate table theme fields (tables inherit cell text styles). Map pit table look via `tableOptions` + default/link/raw styles; no dedicated `MarkdownTheme.table*` required for pi parity.

## (e) Link rendering

- Markdown link tokens emit `TextChunk`s with `link: { url }` and styles `markup.link*` .
- Fenced/prose URL autodetection: private `_linkifyMarkdownChunks` → `detectLinks(chunks, { content, highlights })` from `lib/detect-links`.
- OSC8 / underline: carried on the chunk `link` field when the terminal supports it (needs human TTY verification). Styled-only fallback is automatic when links are unsupported.

## Mapping table: pi `MarkdownTheme` → 0.4.3

| pi field | 0.4.3 mechanism |
| --- | --- |
| `heading` | `markup.heading` (+ optional `markup.heading.1..6`; pi applies bold/underline by depth in render — encode in domain mapper) |
| `bold` | `markup.strong` / `markup.bold` |
| `italic` | `markup.italic` |
| `strikethrough` | `markup.strikethrough` |
| `underline` | No dedicated markup group; fold into link styles (`underline: true` on `markup.link*`) or default text attrs |
| `code` (inline) | `markup.raw` / `markup.raw.inline` |
| `codeBlock` | `markup.raw.block` + default `CodeRenderable` / `createMarkdownCodeBlockRenderer` |
| `codeBlockBorder` | Custom code-block renderer chrome, or `conceal` / border on override Box |
| `codeBlockIndent` | Custom renderer padding / content indent (not built-in) |
| `highlightCode` | Tree-sitter via `CodeRenderable` + `syntaxStyle` token colors (not a chalk line fn) |
| `quote` | `markup.quote` |
| `quoteBorder` | Blockquote border color from `conceal` / custom `renderNode` |
| `listBullet` | `markup.list` |
| `link` | `markup.link` / `markup.link.label` |
| `linkUrl` | `markup.link.url` |
| `hr` | HR `BoxRenderable`; color from `conceal` / `fg` (no `markup.hr` group — gap) |
| `DefaultTextStyle` | `default` + `MarkdownOptions.fg`/`bg` |
| `preserveOrderedListMarkers` | **Not in 0.4.3** — document divergence; accept marked normalization |
| `preserveBackslashEscapes` | **Not in 0.4.3** — document divergence |

## Symbols for t-002 / t-003

Adapter (`components/markdown/`):

- `MarkdownRenderable`, `MarkdownOptions` (opentui), `createMarkdownCodeBlockRenderer`, `MarkdownCodeBlockRendererMap`
- `CodeRenderable` / `CodeOptions` (fence override)
- `SyntaxStyle.fromStyles`
- `BoxRenderable` (padding shell, matching Text/Box pattern)

Domain (`domain/styling/`):

- `markdownThemeToSyntaxStyles` (and helpers) — pure `PitStyle` / theme → `Record<string, StyleDefinitionInput>`-shaped plain objects
- `streaming-doc.ts` — stable-prefix / tail-block split for setText deltas (t-004)

## Streaming mitigation plan (t-004)

1. Prefer opentui built-in: `streaming: true` during growth; `false` on complete.
2. Domain `StreamingDoc`: split at last double-newline; cache stable prefix hash; report whether a delta only dirties the tail (unit-tested with plain strings).
3. Demo: 2000-word doc, ~30Hz growing `setText` for 20s under `scripts/dev.sh`; record CPU in this file after the run.

## API gaps vs checkout / pi

- No `markup.hr` style group in 0.4.3 (hr uses conceal/fg).
- No `preserveOrderedListMarkers` / `preserveBackslashEscapes` on `MarkdownRenderable`.
- `SyntaxStyle` construction requires FFI — never call it from `domain/` or from `node --test` without injection.
- Per-heading-level styling exists (`markup.heading.N`); pi uses one `heading` chalk fn plus bold/underline by depth — domain mapper expands one theme.heading into level entries.
