# Dogfood checklist — one pass, ~10 min

Run `scripts/dev.sh` in an OSC52-capable terminal (kitty/iTerm2/WezTerm), inside a git repo. Check items off in another pane.

## Core input (2 min)

1. [x] **Footer**: bottom line shows `cwd │ branch │ model │ thinking │ tokens` — after the first reply it also shows `ctx N%`. Send `/name demo` → footer gains `demo`.
2. [x] **Prompt history**: send two messages, then press **up** twice on the empty editor → recalls them newest-first; **down** returns to your draft.
3. [x] **History + edit**: recall an entry, type a char → recall mode exits (up now moves the cursor).

## Bash mode (2 min)

4. `!ls -la` → output streams into a `$ ls -la` box; **ctrl+o** expands/collapses it.
  - Streams output, doesn't show `ctrl+o` tooltip.
5. `!sleep 30` then **Esc** → shows `cancelled`, prompt is usable immediately.
  - Works, but cancelled is not colored red.
6. [x] `!!echo secret` → runs with an `(excluded)` marker; then ask the model "what did my last shell command output?" → it should NOT know.

## Queue + thinking (2 min)

7. [x] While the model is streaming a long answer: type a message, press **alt+enter** → editor clears, a muted `Follow-up: …` line appears above the editor; it sends after the run ends.
8. Queue one again, press **alt+up** → text returns to the editor, pending line disappears.
  - Sends, but no queue is shown
9. [x] On a thinking-capable model: a collapsed `Thinking…` line appears above the answer; **ctrl+t** expands ALL thinking blocks, again collapses.

## Models + sessions (2 min)

10. **ctrl+p** / **shift+ctrl+p** → model cycles with a notice; footer updates. `/scoped-models` → toggle a few with enter, reorder with **alt+↑/↓**, **ctrl+s** saves; ctrl+p now cycles only those.
  - model cycles work, scoped-models looks broken, should be similar to pi-tui shows models
  - screenshot of broken picker: /Users/jalbarran/Pictures/SCR-20260710-mtxs.png
11. `/tree` → navigate with ↑/↓, fold with **ctrl+left**, filter with **ctrl+u** (user-only), **shift+l** to label a node; enter branches there and the transcript replays.
  - works but picker looks weird: /Users/jalbarran/Pictures/SCR-20260710-muhu.png
12. `/fork` → new session (footer/session change); `/session` shows stats; `/new` starts clean.

## Clipboard + misc (2 min)

13. **Drag-select** a message with the mouse → release → paste elsewhere: text matches; footer flashed `Copied N lines`. `/copy` copies the last assistant reply.
  - works!
14. [x] Copy an image (screenshot to clipboard), **ctrl+v** → `Image attached (1)`; send a message → model sees the image. **ctrl+y** opens it externally.
15. [x] **ctrl+g** opens $EDITOR with the draft, save+quit returns it; **ctrl+z** suspends, `fg` restores cleanly; `/compact` shows `Compacting context…`, ends with a collapsible `Compaction summary (N→M tokens)`; typing a prompt DURING compaction says "Queued until compaction finishes" and sends after; **ctrl+d** on an empty editor exits (double-ctrl+c still works).

## Extras from session

- doing ctrl+c does not clear current text on messagebox

## Retest round 2 (after pit-dogfood-fixes)

All round-1 findings addressed — re-check just these:

- **#4** — collapsed bash output now ends with `… N more lines (ctrl+o expands)`.
- **#5** — `cancelled` / `exit N` render in the error color.
- **#8** — the pending line now tracks the SDK queue exactly (appears on alt+enter, disappears when the queue flushes after the run); **alt+up** restores queued text into the editor. Root cause was display desync, not the key.
- **#10** — `/scoped-models` is now a bordered, windowed picker (12 rows, `↑/↓ N more` markers, hint line) — no more overflow.
- **#11** — `/tree` is bordered+windowed; linear runs render FLAT (indent only at real branch points); no orphan `▾` rows.
- **ctrl+c** — with text in the editor it now CLEARS it (one press); empty-editor double-ctrl+c exit unchanged (so 3 presses exit from a dirty editor).
- **#12** — still unverified from round 1: `/fork` switches session, `/session` shows stats, `/new` starts clean.

## If something fails

Note the item number + what happened. Each maps to a plan in `.plans/` — file a fix plan referencing it.
