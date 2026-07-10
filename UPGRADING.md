# Upgrading pit against upstream pi

pit tracks upstream pi through `@earendil-works/pi-coding-agent` (SDK) and `@earendil-works/pi-tui` (keybinding data only — pit never uses pi-tui's renderer). Most behavior is SDK-delegated and arrives automatically on a version bump; this document is the ritual for everything else.

## The ritual

1. **Bump both packages together, same version line**: `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` in `packages/*/package.json`, then `pnpm install`.
2. **Run `pnpm test`.** Three tripwires fire here:
   - **Strict typecheck** (`tsc --noEmit`) fails on any SDK API signature change (pi is 0.x — breaking changes are allowed and expected).
   - **Keybinding parity tests** (`packages/app/src/adapters/keybindings/upstream-parity.test.ts`) fail if upstream keybinding ids/defaults drift from pit's fallback port. The tui.* case compares against `@earendil-works/pi-tui`'s exported `TUI_KEYBINDINGS`; the app.* case reads the installed SDK's `dist/core/keybindings.js` directly (the exports map blocks bare-specifier deep imports, but direct file paths work — test-only). If the dist layout changes on an upgrade, the test fails loudly; update its path then.
   - **Extension live-gate** (`live-gate.test.ts`) fails if the extension binding contract breaks.
3. **Skim upstream for NEW surface** — new features do NOT auto-appear in pit: `pi-mono/packages/coding-agent/docs/keybindings.md` (new actions), the changelog (new slash commands, new `ExtensionUIContext` methods). File a plan under the `pit-keybinding-parity` initiative when something new lands.
4. **Manual drift surfaces** (no tripwire; verify by dogfood when upstream touches them): tree navigator fold/filter semantics, scoped-models selection rules, thinking-block rendering, session-picker internal keys.

## Keybinding data sourcing

`packages/app/src/adapters/keybindings/upstream-defs.ts` picks the definitions source at runtime:

- **Preferred**: `sdk.KEYBINDINGS` + `sdk.migrateKeybindingsConfig` from `@earendil-works/pi-coding-agent` — feature-detected; used automatically if a future SDK version root-exports them (nice-to-have, nothing depends on it).
- **Today**: upstream `TUI_KEYBINDINGS` from `@earendil-works/pi-tui` (live upstream data) merged with pit's ported `app.*` definitions (`packages/app/src/domain/keybindings/`). The app.* port cannot drift silently — the parity test compares it against the installed SDK's actual definitions on every `pnpm test`.
