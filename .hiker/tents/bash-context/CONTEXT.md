# bash-context

**Invariant**: bang count on a bash-mode input determines whether the command's output is excluded from session context — `!!cmd` is excluded (`excluded == 1`), `!cmd` is included (`excluded == 0`). The law prevents an implementation from collapsing `!!` into `!` (the shortcut that would make a simpler parser pass ordinary tests while silently including bang-bang output in context).

**Code anchors**: `packages/app/src/domain/bash/parse.ts` (`parseBashInput`, `classifies`); the bash-runner adapter that passes `excludeFromContext` into the SDK `executeBash` call.

**Expressiveness boundary**: hiker's TypeScript codegen targets vitest, which pit does not use, so the law is enforced by an exhaustive `node:test` conformance test that calls `classifies(i)` (named per the gen convention so `hiker gen` can be wired later without code change). Command extraction, trimming, and null cases sit outside the model and are covered by normal parser tests.
