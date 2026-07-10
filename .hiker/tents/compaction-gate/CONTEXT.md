# compaction-gate

**Invariant**: a prompt submitted while the session is compacting must be QUEUED (`queued == 1`, `sent == 0`), never sent and never dropped; when idle it must be sent (`sent == 1`, `queued == 0`), not queued. The law prevents an implementation from collapsing the gate (sending during compaction, or silently dropping the message).

**Code anchors**: `packages/app/src/domain/compaction/gate.ts` (`decideSubmission`, `gates`); the compaction-runner adapter `gate()`; `ChatShell.submit`.

**Expressiveness boundary**: hiker's TypeScript codegen targets vitest, which pit does not use, so the law is enforced by an exhaustive `node:test` conformance test that calls `gates(s)` (named per the gen convention so `hiker gen` can be wired later without code change). Flush ordering and error paths sit outside the model and are covered by normal tests.
