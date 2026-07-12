# Product

## Register

product

## Platform

terminal

Non-standard value on purpose: pit renders into a terminal cell buffer via OpenTUI's native renderer. Web and native-mobile rulebooks (responsive breakpoints, HIG, Material) do not apply; the design medium is monospaced cells, ANSI/truecolor, and terminal capabilities (Kitty graphics, mouse, OSC sequences).

## Users

The author, dogfooding pit as a daily driver for the pi coding agent. There is exactly one user and they are also the maintainer: every rough edge is felt immediately, every design decision is validated by hours of daily use rather than by adoption metrics. The usage context is long interactive coding sessions in a modern terminal (kitty/ghostty-class), with the agent streaming output, tool executions unfolding, and the user reading, steering, and editing in the same screen.

## Product Purpose

pit is a fullscreen terminal frontend for the pi coding agent, backed by OpenTUI's native cell-buffer renderer instead of `@earendil-works/pi-tui` string rendering. It exists to give pi a frontend that behaves like a real application — components, overlays, focus, mouse, images — rather than printed text. Success is simple and binary: pit is the daily driver, and the stock pi TUI is never reached for.

## Positioning

The pi agent with capabilities string rendering can't have: mouse interaction, inline images, real overlays, and richer components — a frontend, not a printout.

## Brand Personality

Calm, precise, fast. Nothing fights for attention while the agent streams; chrome stays quiet and lets the content lead. Glyphs, alignment, and spacing are deliberate — nothing approximate, nothing decorative for its own sake. Feedback is instant and motion communicates responsiveness, never spectacle. Reference points: opencode for polished agent-TUI chrome (an opencode-parity doc lives in `packages/app/docs/`), Helix/Neovim for editor-grade responsiveness, btop for what terminals can do when capability is pushed with intent.

## Anti-references

- Emoji soup: emoji-heavy, boxed, over-decorated CLI chrome.
- A webpage in a terminal: heavy borders everywhere, card layouts, gradients faked with block characters. Terminal-native economy, not web imitation.
- Enterprise drab: gray, lifeless, no identity. Calm is not the absence of character.

## Design Principles

1. **Theme roles, not colors.** pit consumes pi's semantic theme system (`toolOutput`, `brand`, `error`, `success`, `connector`, …). Components name roles; users pick palettes. Never hard-code a color where a role exists.
2. **Calm under streaming.** The busiest moment — agent output flowing, tools running — is the moment the UI must be quietest. Status chrome earns its place or stays out.
3. **Capability with restraint.** Mouse, images, overlays exist because string rendering can't do them, not to show off. Each capability ships when it's genuinely better than the plain alternative.
4. **Instant or absent.** Feedback is immediate; anything that can't be fast doesn't animate. Motion is minimal and never load-bearing.
5. **Meaning survives the theme.** Status is carried by glyphs and text (✓ ✗) alongside color, never color alone, and every semantic role must stay readable in any user theme, light or dark.

## Accessibility & Inclusion

Contrast is a per-theme contract: semantic roles must remain legible against the theme's background in both light and dark palettes. Motion is restrained — spinners and animation are minimal and never the only signal of state. Meaning is never encoded in color alone; glyphs and text carry it in parallel.
