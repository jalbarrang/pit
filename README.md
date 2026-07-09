# pit

pit is a fullscreen terminal frontend for the pi coding agent, backed by OpenTUI's native renderer instead of `@earendil-works/pi-tui` string rendering.

## Runtime

Use Node 26.4.0 or newer with experimental FFI enabled. `scripts/dev.sh` intentionally runs `node --experimental-ffi "$@"`, so make sure `node` on `PATH` points at a compatible runtime before launching pit.

## Running

```bash
pnpm --filter @pit/app exec pit --cwd "$PWD"
scripts/dev.sh packages/app/src/main.ts --cwd "$PWD"
scripts/dev.sh packages/app/src/chat-smoke.ts
pnpm test
```

The `pit` wrapper checks for Node >=26.4.0, launches `packages/app/src/main.ts` with `--experimental-ffi`, creates a real pi SDK session from the current credentials, and opens the fullscreen chat UI. Use `--cwd PATH` to choose the project directory; `--resume` is parsed as a placeholder for the later session-chrome plan.

## Working agreements

The binding agreements live in `.plans/pit-opentui-frontend/INITIATIVE.md`.

1. TDD: work in red-green-refactor vertical slices, one behavior at a time.
2. DDD: keep bounded contexts explicit and point dependencies inward.
3. File size: every authored file stays at or below 100 lines; lockfiles are exempt.

## Layout

```text
packages/tui/src/domain/input         pure input domain
packages/tui/src/domain/composition   pure layout/composition domain
packages/tui/src/domain/styling       pure style/ANSI domain
packages/tui/src/components           OpenTUI renderable adapters
packages/tui/src/tui                  TUI facade adapters
packages/app/src/domain               conversation domain
packages/app/src/application          use cases over domain ports
packages/app/src/adapters/session     pi SDK gateway
packages/app/src/adapters/shell       OpenTUI shell wiring
packages/app/src/adapters/extensions  extension compatibility
packages/app/src/components           app UI components
```

## Test harness

`pnpm test` runs `scripts/check-file-size.sh` first, then strict typecheck for both workspace packages, then Node's built-in test runner over `packages/*/src/**/*.test.ts`. Live OpenTUI checks still need a TTY through `scripts/dev.sh` or the `pit` wrapper because native rendering requires `--experimental-ffi`.
