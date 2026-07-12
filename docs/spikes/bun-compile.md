# Bun compile spike

## Decision context

pit currently runs TypeScript directly under Node 26 with `--experimental-ffi`. The binary-release initiative needs a self-contained per-platform artifact. The preferred rung was Bun because OpenTUI supports `bun:ffi` directly and opencode ships OpenTUI 0.4.3 (the same version pit uses) through `Bun.build({ compile: ... })`. Node SEA was the fallback if Bun could not run the pi SDK, embed OpenTUI, render the app, or load external extensions.

## Environment

- macOS arm64
- Bun 1.3.14
- `@opentui/core` 0.4.3
- `@earendil-works/pi-coding-agent` 0.80.x
- Spike branch: `spike/binary-packaging`

## Source runtime result

Bun ran pit from source without a compatibility shim. A real PTY reached the normal footer with cwd, branch, and model. A direct `AppSession` prompt streamed `PIT_BUN_MODEL_OK` in 2.34 seconds. `executeBash("printf PIT_BUN_SHELL_OK")` returned output `PIT_BUN_SHELL_OK`, exit code 0, and `cancelled: false`. The bash expansion component tests passed under `bun test` (4/4).

## Compile result

The unmodified entry compiled successfully in 0.32 seconds to an 80 MB arm64 Mach-O:

```sh
bun build --compile --target=bun-darwin-arm64 --outfile /tmp/pit-spike ./packages/app/src/main.ts
```

That first artifact did not start because Bun could not resolve `omggif` from `/$bunfs/root/pit-spike`. Adding a side-effect import was insufficient because pit loads `omggif`, `upng-js`, and `jpeg-js` through `createRequire(import.meta.url)`. Bun left those runtime requires external.

After temporarily replacing those three `createRequire` calls with static imports, startup reached terminal initialization but did not paint. Component-level instrumentation found the app hanging in `createTheme()`: `loadThemeJson()` reads `themes/*.json` using `readFileSync(new URL(..., import.meta.url))`, which points into bunfs without embedding the JSON. Temporarily replacing that filesystem read with static imports of `dark.json` and `light.json` fixed it.

The working build uses the same parser-worker pattern as opencode: `Bun.build()` with `conditions: ["bun", "node"]`, ESM splitting, `parser.worker.js` as a second entrypoint, and `OTUI_TREE_SITTER_WORKER_PATH` defined to the worker's `/$bunfs/root/...` path. The relevant shape is:

```ts
await Bun.build({
  entrypoints: ["./packages/app/src/main.ts", parserWorker],
  conditions: ["bun", "node"],
  format: "esm",
  splitting: true,
  compile: { target: "bun-darwin-arm64", outfile: "/tmp/pit-spike" },
  define: { OTUI_TREE_SITTER_WORKER_PATH: JSON.stringify(`/$bunfs/root/${workerRelativePath}`) },
});
```

With the two source-level asset fixes applied temporarily, the build took 0.22 seconds and the compiled app painted the normal pit footer in tmux. The temporary source edits were restored after compilation; this spike commits only this document.

## Risk inventory

| Probe | Result | Evidence |
|---|---|---|
| OpenTUI native FFI | Pass | Compiled app painted a live frame on macOS arm64. |
| pi SDK model streaming | Pass | Full compiled TUI prompt rendered `PIT_COMPILED_MODEL_OK`. |
| Bash execution | Pass | `!seq 1 30` executed and rendered output. |
| Expand/collapse interaction | Pass | Collapsed view showed `… 10 more lines (ctrl+o expands)`; Ctrl+O exposed lines 1 through 30. |
| External TypeScript extension | Pass | A compiled live-gate probe loaded `packages/app/src/adapters/extensions/fixtures/pit-confirm.ts` by absolute path and emitted `gate:yes`. |
| Image decode and placeholder | Pass | Compiled probe returned `FrameBufferRenderable` for a valid GIF and `BoxRenderable` for corrupt image data. |
| Binary size | Pass | 80 MB, below the 150 MB spike ceiling. |
| Startup | Partial pass | Warm process-to-first-frame measurements were 0.79 seconds; the first-ever launch measured 1.52 seconds, so the strict <1 second cold target is not met on first launch. This is not a release blocker. |

## Production changes required by the build-pipeline plan

1. Replace `createRequire` usage in `packages/tui/src/domain/styling/image/gif.ts` and `packages/tui/src/domain/styling/image/decode.ts` with static imports for `omggif`, `upng-js`, and `jpeg-js`. Keep Node tests green; these packages are pure JavaScript.
2. Replace runtime filesystem reads in `packages/app/src/domain/theming/load.ts` with static JSON imports for the built-in themes. This also removes a source/runtime filesystem dependency and remains compatible with Node's native JSON module support only if the chosen import syntax works under the repository's Node 26 test runner; verify before landing. If Node rejects static JSON imports without attributes, generate a TypeScript theme module at build time or use an explicit build-only alias rather than regressing the source path.
3. Build through the `Bun.build()` JavaScript API, not only the CLI, so the parser worker can be included as an entrypoint and its bunfs path defined.
4. Preserve `conditions: ["bun", "node"]`; opencode needed the Node condition to avoid dependency-runtime hangs.
5. Smoke-test each current-platform artifact with a real PTY/frame probe, not only `--version`, because missing decoder/theme assets can compile successfully and fail only at startup.

## SEA fallback status

Node SEA was not attempted. The plan explicitly limited the SEA arm to a Bun hard blocker; Bun passed every compatibility-critical probe, including dynamic extension loading. SEA remains a documented fallback if future Bun/OpenTUI changes regress the chosen path.

**Decision: use rung 1 (`Bun.build({ compile: ... })`) for pit's binary build pipeline; revise the pipeline implementation to include static decoder/theme assets and a real-frame smoke test.**
