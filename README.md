# pit

pit is a fullscreen terminal frontend for the pi coding agent, backed by OpenTUI's native renderer instead of `@earendil-works/pi-tui` string rendering.

## Install & Run

Requirements: Node 26.4.0 or newer, pnpm 11.10.0 for workspace development, and a terminal/runtime that can load OpenTUI's native FFI package for your platform.

```bash
pnpm install
pnpm --filter @pit/app exec pit --cwd "$PWD"
packages/app/bin/pit --cwd "$PWD"
packages/app/bin/pit --cwd "$PWD" --resume
scripts/dev.sh packages/app/src/chat-smoke.ts
pnpm test
```

The `pit` wrapper resolves the app entry relative to the real wrapper path, so it works from any current directory and through symlinks such as `~/bin/pit`. It checks `node` on `PATH` for Node >=26.4.0, then launches `packages/app/src/main.ts` with `--experimental-ffi`.

### npm publishability

The workspace packages are versioned `0.1.0`, but publishing is constrained by OpenTUI's native platform packages and Node's experimental FFI support. Publish only after verifying the target package includes or can resolve the correct `@opentui/core` optional native dependency for the supported OS/CPU matrix; today the tested path is local workspace install on macOS with Node 26.4.0.

## Known Issues

- Inline terminal graphics are not implemented in pit 0.1.0. OpenTUI 0.4.3 exposes terminal capability detection for Kitty graphics/sixel but no installed renderable or public passthrough API for placing graphics inside the cell-buffer frame, so pit renders image tool results as bordered placeholders with dimensions and opens the latest image externally with `Ctrl-Y` on macOS.
- Mouse support covers click-to-focus on the editor and click-to-toggle on tool boxes; wheel scrolling remains handled by the chat ScrollBox. Drag-select plus copy is deferred because OpenTUI's selection and OSC52 clipboard APIs are renderer-level primitives, not a finished wiring for pit's mixed ScrollBox/message component tree.
- `setWorkingIndicator` visual variants / `setHiddenThinkingLabel` are accepted by extension compatibility code but only partially reflected by current streaming chrome.
- `addAutocompleteProvider` from extensions is currently a no-op.
- Deep pi-tui internals and extensions that import `@earendil-works/pi-tui` directly may not bridge cleanly unless they expose `render(width): string[]` or a pit-native `.renderable`.

## Working agreements

The binding agreements live in `.plans/pit-opentui-frontend/INITIATIVE.md`.

1. TDD: work in red-green-refactor vertical slices, one behavior at a time.
2. DDD: keep bounded contexts explicit and point dependencies inward.
3. File size: every authored file stays at or below 100 lines; lockfiles are exempt.

## Layout

```text
packages/tui/src/domain/input         pure input domain
packages/tui/src/domain/composition   pure layout/composition domain
packages/tui/src/domain/styling       pure style/ANSI/image domain
packages/tui/src/components           OpenTUI renderable adapters
packages/tui/src/tui                  TUI facade adapters
packages/app/src/domain               conversation/chrome domain
packages/app/src/application          use cases over domain ports
packages/app/src/adapters/session     pi SDK gateway
packages/app/src/adapters/shell       OpenTUI shell wiring
packages/app/src/adapters/extensions  extension compatibility
packages/app/src/components           app UI components
```

## Test harness

`pnpm test` runs `scripts/check-file-size.sh` first, then strict typecheck for both workspace packages, then Node's built-in test runner over `packages/*/src/**/*.test.ts`. Live OpenTUI checks still need a TTY through `scripts/dev.sh`, `packages/app/bin/pit`, or `script -q /dev/null bash -c 'node --experimental-ffi packages/app/src/perf-stress.ts'` because native rendering requires `--experimental-ffi`.
