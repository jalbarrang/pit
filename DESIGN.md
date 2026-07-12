---
name: pit
description: A fullscreen terminal frontend for the pi coding agent — the Night Console.
colors:
  signal-pink: "#ff5f87"
  violet: "#a78bfa"
  success-green: "#7fd88f"
  error-red: "#ff6b6b"
  heading-amber: "#e8bc70"
  text: "#d8d4e0"
  muted: "#6b6478"
  dim: "#514a5c"
  connector: "#3a3444"
  night: "#121016"
  status-bar: "#16131c"
  tool-pending: "#19151f"
  tool-success: "#171d1a"
  tool-error: "#22171b"
  chip-muted: "#1d1826"
  chip-raised: "#2a2434"
  user-message: "#251d36"
  selected: "#30293b"
typography:
  mono:
    fontFamily: "terminal-defined monospace"
    fontWeight: 400
components:
  chip-brand:
    backgroundColor: "{colors.signal-pink}"
    textColor: "{colors.night}"
  chip-raised:
    backgroundColor: "{colors.chip-raised}"
    textColor: "{colors.text}"
  chip-muted:
    backgroundColor: "{colors.chip-muted}"
    textColor: "{colors.muted}"
---

# Design System: pit

## 1. Overview

**Creative North Star: "The Night Console"**

pit is a dark operator's desk: dim chrome, signal colors only where signal exists. The medium is a monospaced cell buffer, so the system has no shadows, no font sizes, no rounded corners — depth is tonal, hierarchy is attribute-and-color, and layout is measured in cells. The interface is instrumented but quiet: every state (running, succeeded, failed, expanded) is legible at a glance, and nothing animates at rest. The busiest moment — the agent streaming, tools executing — is the moment the chrome stays quietest.

The system explicitly rejects emoji soup (over-decorated CLI chrome), the webpage-in-a-terminal (heavy borders, card layouts, faked gradients), and enterprise drab (gray and lifeless). pit is terminal-native economy with a distinct identity: Signal Pink on near-black night, violet for everything interactive.

**Key Characteristics:**
- Semantic theme roles, never raw colors in components (`theme.color("toolOutput")`, not hex)
- Two complete palettes (dark canonical, light counterpart in `packages/app/src/domain/theming/themes/`)
- Depth via tonal background tints, not borders or box art
- One mono size; hierarchy from bold/underline/color attributes
- Meaning carried by glyphs (✓ ✗ ⚙ ⠸) in parallel with color

## 2. Colors: The Night Console Palette

A violet-tinted near-black field where one hot accent marks identity and live activity, and everything else recedes into a graded dusk.

### Primary
- **Signal Pink** (#ff5f87): identity and live signal only — the `pit` brand chip in the footer, the ⠸ running indicator on active tools, inline code in markdown, the hottest thinking-level tier. Its rarity is its meaning.

### Secondary
- **Violet** (#a78bfa): everything interactive or navigational — the model chip, tool glyphs (⚙), expand hints, links, list bullets, borders, the medium thinking tier. Violet says "you can act here."

### Tertiary
- **Success Green** (#7fd88f) / **Error Red** (#ff6b6b) / **Heading Amber** (#e8bc70): status and structure. Green for ✓ and `+added`, red for ✗ and `-removed`, amber for markdown headings and warnings. Always paired with a glyph or text; never the sole carrier of meaning.

### Neutral
- **Text** (#d8d4e0): primary reading color.
- **Muted** (#6b6478): secondary text — tool output, cwd, usage, quotes.
- **Dim** (#514a5c): tertiary — link URLs, de-emphasized metadata.
- **Connector** (#3a3444): structural lines — tree prefixes (│ └), markdown rules, code-block borders. Visible but never competing with content.
- **Night** (#121016): the page. A violet-tinted near-black, not pure black.

### Named Rules
**The Signal Rule.** Signal Pink appears only where identity or live activity exists. If nothing is happening and it isn't the brand, it isn't pink.

**The Role Rule.** Components reference semantic roles via `theme.color("…")`; raw hex lives only in `themes/*.json`. Every role must resolve legibly in both dark and light.

## 3. Typography

**Mono Font:** terminal-defined monospace (pit never picks a font; the terminal does)

**Character:** one family, one size, everywhere. All hierarchy comes from terminal attributes (bold, underline, italic, strikethrough, dim) and color assignment — a discipline, not a limitation.

### Hierarchy
- **H1** (bold + underline, heading-amber): top-level markdown headings.
- **H2–H3** (bold, heading-amber): section headings.
- **Emphasis** (bold / italic): inline markdown strong and emphasis, in the surrounding text color.
- **Body** (regular, text #d8d4e0): messages and prose.
- **Secondary** (regular, muted #6b6478): tool output, metadata, quotes.
- **Code** (Signal Pink inline; success-green in blocks with connector-colored fences).

### Named Rules
**The One-Size Rule.** There is exactly one glyph size. Anything that "needs to be bigger" must instead be bolder, brighter, or set apart by space.

## 4. Elevation

No shadows exist in a cell buffer; pit conveys depth entirely through **tonal layering** — a ladder of violet-tinted backgrounds rising off the night field. Surfaces closer to the user are slightly lighter; state-bearing surfaces are tinted toward their state's hue.

### Tint Ladder (dark theme)
- **Night** (#121016): the page.
- **Status bar** (#16131c): fixed chrome, half a step up.
- **Tool pending** (#19151f) / **tool success** (#171d1a, green-tinted) / **tool error** (#22171b, red-tinted): tool result panels, tinted by outcome.
- **Chip muted** (#1d1826) → **chip raised** (#2a2434): footer segments, two rungs of prominence.
- **User message** (#251d36) and **selected** (#30293b): the highest rungs — your own words and your current focus sit closest.

### Named Rules
**The Tint Ladder Rule.** Depth is a background tint, never a border. Borders are reserved for structure that would otherwise be ambiguous (code fences, overlay edges) and always in connector color.

## 5. Components

Instrumented but quiet: every state legible at a glance, nothing animated at rest.

### Footer / Status Bar
- **Style:** single-row chip train on status-bar bg; chips carry their own space padding (OpenTUI doesn't paint padding cells).
- **Brand chip:** Signal Pink bg, night text, bold — the only pink at rest.
- **Branch / usage chips:** chip-raised bg, text/muted fg. **Cwd / model chips:** chip-muted bg; model in violet (interactive).
- **Behavior:** middle segments shrink and truncate; the chip train never wraps.

### Tool Execution Rows
- **Collapsed:** one line — ⚙ (violet) + tool name (text) + args (muted) + state: `⠸ running` (Signal Pink), `✗ failed` (error-red), `+n −n` diff counts (green/red), or `✓` (green).
- **Expanded:** output lines behind connector-colored tree prefixes (│ └), body in muted; `… · enter to expand` hint with `enter` in violet.

### Markdown
- Headings amber (bold/underline per level), links violet with dim URLs, inline code Signal Pink, code blocks green inside connector-colored fences, quotes muted behind a connector border, bullets violet.
- Syntax highlighting uses its own nine-role ramp (`syntaxComment` green-gray, `syntaxKeyword` soft violet, `syntaxString` peach, …) defined per theme.

### Select / Settings Lists
- **Selection:** selected-bg row highlight; no marker glyph needed — the tint is the cursor.
- **Behavior:** keyboard-first; click-to-focus supported.

### Editor
- Plain text on the page bg; focus is communicated by the hardware cursor and row highlight, not chrome. Autocomplete popup rides the tint ladder.

### Diff View (signature)
- Added lines green, removed red, context muted — glyph-and-color paired (`+`/`-` prefixes), readable in both themes.

## 6. Do's and Don'ts

### Do:
- **Do** reference every color through a semantic role (`theme.color("expandHint")`); add new roles to both `dark.json` and `light.json` in the same change.
- **Do** pair every color-coded state with a glyph or word (✓ ✗ ⚙ ⠸ `+n −n`) — meaning must survive monochrome.
- **Do** use the tint ladder for prominence; a lighter background is pit's shadow.
- **Do** collapse to one line first; expansion is opt-in (`enter to expand`).
- **Do** keep motion minimal and stateful — the ⠸ spinner exists only while something runs.

### Don't:
- **Don't** produce *emoji soup*: no emoji in chrome, status, or labels; the glyph vocabulary is ✓ ✗ ⚙ ⠸ │ └ ─ and it is closed — extending it is a design decision, not a convenience.
- **Don't** build *a webpage in a terminal*: no heavy borders around every region, no card grids, no gradients faked with block characters.
- **Don't** ship *enterprise drab*: if a screen renders entirely in text/muted/dim with no violet or Signal Pink anywhere, something has lost its identity.
- **Don't** hard-code hex in a component — if it isn't in `themes/*.json`, it doesn't exist.
- **Don't** let Signal Pink decorate. If it's pink and it's neither the brand nor live activity, recolor it.
