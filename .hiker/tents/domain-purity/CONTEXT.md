# domain-purity

**Invariant**: pit's DDD rule — every production module under `packages/*/src/domain/**` is pure: zero imports of `@opentui/core`. Adapters (`packages/*/src/adapters/**`), components, and the tui shell own all terminal/renderer contact. Test files (`*.test.ts`) are exempt (they import `node:test` and may import fakes).

**The collapse this prevents**: an agent wiring a feature "just imports the renderable type/value in domain because it's convenient", making a test pass while breaking the layering that keeps domain logic FFI-free and unit-testable.

**Code anchors**: `packages/app/src/domain/**`, `packages/tui/src/domain/**`. Enforcement was previously an ad-hoc grep in review notes; it is now `scripts/extract-intent-facts.sh` → `hiker verify` in the `pnpm intent` script (part of `pnpm test`).

**Expressiveness boundary**: the model sees only the extracted import facts — it does not check SDK (`@earendil-works/*`) imports (pit permits type-only SDK imports in domain, which a grep cannot distinguish from value imports), nor file size, nor directory placement of new code. Those remain covered by `tsc` strict mode, `check-file-size.sh`, and review.
