# Deploying pit

pit ships from `main` on two release channels — **stable** and **nightly** — both published as GitHub Releases. There is no npm publish (see the npm publishability note in `README.md`) and there are no release branches: channels are tag patterns, not branches.

## Philosophy

1. **`main` is the only branch.** Nothing is merged into or cherry-picked onto release branches, because none exist. `vX.Y.Z` tags are the stable channel; `vX.Y.Z-nightly.<date>.<run>` tags are the nightly channel.
2. **Every commit on `main` is release-grade by construction.** CI (`.github/workflows/ci.yml`) runs the full `pnpm test` gate — file-size check, hiker intent verification, typecheck, node tests — on every push to `main` and every PR. Releasing is pointing at a commit, not preparing one. The release workflow re-runs the same gate anyway before publishing.
3. **Stable = human intent, nightly = automation.** A stable release is a deliberate act: a human picks the moment and the semver meaning of the change. Everything mechanical after that decision is automated. Nightly requires no decision, so no human is involved.
4. **Channels never collide.** Nightlies version themselves as the next patch above the current stable (`0.1.0` stable → `0.1.1-nightly.*`), so they sort above the released stable and below the next one. Release notes diff each channel only against its own previous tag.

## Installer

The root `install` script is the primary end-user install path: `curl -fsSL https://raw.githubusercontent.com/jalbarrang/pit/main/install | sh`.

Flags: `--channel stable` (default; GitHub `/releases/latest`) or `--channel nightly` (first prerelease in `/releases?per_page=30`); `--version X.Y.Z` pins an exact tag (leading `v` stripped). Env overrides: `PIT_REPO` (default `jalbarrang/pit`), `PIT_INSTALL_DIR` (default `$HOME/.pit/bin`). Supported targets match `scripts/build-binary-lib.ts`: `aarch64-apple-darwin`, `x86_64-apple-darwin`, `x86_64-unknown-linux-gnu`, `aarch64-unknown-linux-gnu`. Assets are `pit-<triple>.tar.gz` plus `pit-<triple>.tar.gz.sha256` (shasum -a 256); the archive contains a single `pit` executable at the root. Checksums are verified when the `.sha256` companion is published. Until a stable release publishes binary assets, the default channel errors clearly — use `--channel nightly` or `--version` against a nightly tag.

## Cutting a stable release

From a green `main`:

```bash
gh workflow run release --repo jalbarrang/pit -f channel=stable -f bump=patch
```

Or GitHub → Actions → `release` → "Run workflow". Inputs:

- `bump`: `patch` (default), `minor`, or `major` — applied to the version in the root `package.json`.
- `version`: optional explicit `X.Y.Z` override; wins over `bump`.

The workflow (`.github/workflows/release.yml`) then:

1. Refuses to run unless dispatched from `main`.
2. Resolves the new version with `scripts/release-version.mjs`.
3. Re-runs the full `pnpm test` gate.
4. Writes the version into `package.json`, `packages/app/package.json`, and `packages/tui/package.json`, commits `release: vX.Y.Z` back to `main`, tags `vX.Y.Z`, and pushes both.
5. Publishes a GitHub Release marked **latest**, with source and binary assets plus notes auto-generated since the previous stable tag.

Stable release assets:

```text
pit-X.Y.Z.tar.gz
pit-aarch64-apple-darwin.tar.gz
pit-aarch64-apple-darwin.tar.gz.sha256
pit-x86_64-apple-darwin.tar.gz
pit-x86_64-apple-darwin.tar.gz.sha256
pit-aarch64-unknown-linux-gnu.tar.gz
pit-aarch64-unknown-linux-gnu.tar.gz.sha256
pit-x86_64-unknown-linux-gnu.tar.gz
pit-x86_64-unknown-linux-gnu.tar.gz.sha256
```

Total ceremony: one dispatch. No local tagging, no version editing, no changelog writing.

## Nightly releases

- **Trigger**: daily cron at 06:00 UTC, or a manual dispatch with `channel=nightly`.
- **Skip condition**: the run exits early when `main` has not moved since the last `v*-nightly.*` tag — no commits, no release.
- **Version**: `X.Y.Z-nightly.YYYYMMDD.<run_number>`, where `X.Y.Z` is the next patch above the version in the root `package.json`.
- **Publishing**: always a GitHub **prerelease**, never marked latest, notes generated since the previous nightly tag. Nothing is committed back to `main` — the tag is created directly on the released commit.

Nightly release assets:

```text
pit-X.Y.Z-nightly.YYYYMMDD.N.tar.gz
pit-aarch64-apple-darwin.tar.gz
pit-aarch64-apple-darwin.tar.gz.sha256
pit-x86_64-apple-darwin.tar.gz
pit-x86_64-apple-darwin.tar.gz.sha256
pit-aarch64-unknown-linux-gnu.tar.gz
pit-aarch64-unknown-linux-gnu.tar.gz.sha256
pit-x86_64-unknown-linux-gnu.tar.gz
pit-x86_64-unknown-linux-gnu.tar.gz.sha256
```

## Binary builds

Bun 1.3.14 is a build-time dependency only; source-mode pit remains on Node 26. `scripts/build-binary.ts` owns the validated `Bun.build()` compile shape, including the embedded OpenTUI parser worker and baked release metadata. One Ubuntu runner installs every OpenTUI native package and cross-compiles all four targets. The runner launches its native linux-x64 binary in tmux and requires a rendered footer frame because a compile-only check cannot detect missing embedded themes, decoders, or worker assets; non-native targets receive executable existence and size checks.

## Version math

`scripts/release-version.mjs` owns all version resolution and is the only place versions are computed:

```bash
node scripts/release-version.mjs stable --bump patch          # next stable from package.json
node scripts/release-version.mjs stable --version 2.0.0       # explicit override
node scripts/release-version.mjs stable --bump minor --write  # also writes the three package.json files
node scripts/release-version.mjs nightly --date 20260711 --run 42
```

It prints `version=`, `tag=`, and `channel=` lines, and appends them to `$GITHUB_OUTPUT` when set.

## Quality gate

Both CI and the release workflow run the same gate: `pnpm test` = `scripts/check-file-size.sh` + hiker intent checks (`pnpm intent`) + typecheck + `node --test`. hiker is installed in CI via the `jalbarrang/hiker@v0.1.3` composite action (release-binary install, no cargo build). To bump the hiker version in CI, update the action ref in both workflow files.

## Daily dependency audit

`.github/workflows/audit.yml` runs daily at 05:00 UTC (one hour before the nightly release check) and on manual dispatch:

1. Bumps every dependency to latest with `npm-check-updates` across the workspace (root + both packages; `workspace:*` links are untouched).
2. Runs the full `pnpm test` gate against the bumped set, plus an informational `pnpm audit`.
3. Opens (or updates) a PR on `ci/audit-dependency-bumps` — only when the gate passed, so a red gate means the bump needs human attention and no PR appears.

Upstream pi bumps (`@earendil-works/pi-coding-agent` + `@earendil-works/pi-tui`) always move together and are exercised by the keybinding parity tests and the extension live gate; skim the manual drift surfaces in `UPGRADING.md` before merging those. Merging an audit PR lands on `main`, so the next nightly ships it automatically.

Note: PRs opened with the default `GITHUB_TOKEN` do not trigger the `ci` workflow. The gate already ran inside the audit workflow itself; if you want a CI run on the PR, close and reopen it.

## Troubleshooting

- **"Stable releases must be dispatched from main"**: the workflow was dispatched from another branch or tag. Re-run it against `main`.
- **Nightly run finished without a release**: expected when `main` has no new commits since the last nightly tag — check the preflight job log for "No changes since …".
- **First release of a channel**: with no previous tag in that channel, release notes are generated without a `--notes-start-tag` baseline. This is normal and self-heals on the next release.
- **Gate failures**: the release workflow runs `pnpm test` exactly as CI does; reproduce locally with `pnpm test` and fix on `main` before re-dispatching.
