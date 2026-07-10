# Upgrading pit against upstream pi

pit tracks upstream pi through `@earendil-works/pi-coding-agent` (SDK) and `@earendil-works/pi-tui` (keybinding data only — pit never uses pi-tui's renderer). Most behavior is SDK-delegated and arrives automatically on a version bump; this document is the ritual for everything else.

## The ritual

1. **Bump both packages together, same version line**: `@earendil-works/pi-coding-agent` and `@earendil-works/pi-tui` in `packages/*/package.json`, then `pnpm install`.
2. **Run `pnpm test`.** Three tripwires fire here:
   - **Strict typecheck** (`tsc --noEmit`) fails on any SDK API signature change (pi is 0.x — breaking changes are allowed and expected).
   - **Keybinding parity tests** (`packages/app/src/adapters/keybindings/upstream-parity.test.ts`) fail if upstream keybinding ids/defaults drift from pit's fallback port. The tui.* case is always active; the app.* case activates automatically once the SDK exports `KEYBINDINGS` (see below).
   - **Extension live-gate** (`live-gate.test.ts`) fails if the extension binding contract breaks.
3. **Skim upstream for NEW surface** — new features do NOT auto-appear in pit: `pi-mono/packages/coding-agent/docs/keybindings.md` (new actions), the changelog (new slash commands, new `ExtensionUIContext` methods). File a plan under the `pit-keybinding-parity` initiative when something new lands.
4. **Manual drift surfaces** (no tripwire; verify by dogfood when upstream touches them): tree navigator fold/filter semantics, scoped-models selection rules, thinking-block rendering, session-picker internal keys.

## Keybinding data sourcing

`packages/app/src/adapters/keybindings/upstream-defs.ts` picks the definitions source at runtime:

- **Preferred**: `sdk.KEYBINDINGS` + `sdk.migrateKeybindingsConfig` from `@earendil-works/pi-coding-agent` — used automatically the moment the SDK exports them (upstream plan `export-keybindings-from-sdk` in pi-mono adds this).
- **Fallback (today)**: upstream `TUI_KEYBINDINGS` from `@earendil-works/pi-tui` (live upstream data) merged with pit's ported `app.*` definitions (`packages/app/src/domain/keybindings/`).

Once the SDK export ships and one upgrade goes green with the conditional parity test active, the ported `app.*` fallback in `domain/keybindings/definitions-app.ts` + `migrations*.ts` can be deleted as its own reviewed change.
