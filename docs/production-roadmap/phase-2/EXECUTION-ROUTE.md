# LiNKsites execution route

Status: route verified read-only; no implementation worker or paid job created

## Verified transport

The normal implementation route is the established Keychain-backed Cursor REST
dispatcher:

```text
/Users/linktrend/Documents/Codex/2026-09-09/files-pasted-by-the-user-i/
  outputs/cursor-cloud/cursor_cloud.py
```

Dispatcher SHA-256:
`9c5b5486842e695e47f32896728ec15568237f304ea86115cde50997e419c260`.
It uses Python's standard library and `gh`; it does not require the Cursor
desktop app, local Cursor CLI login or `cursor-sdk` installation.

The read-only `check` action was run on 2026-09-10 and verified:

- account `cursor-001@linktrend.one`;
- API key name `Codex-001` (the key value was neither printed nor copied);
- `grok-4.6`, effort `medium`, Fast `false` is supported; and
- `https://github.com/linktrend/LiNKsites` is visible.

The credential remains in macOS Keychain service `Cursor-Codex-001`, account
`cursor-001@linktrend.one`. Presence is not authority to dispatch; packet
admission and founder approval are separate.

## Commands

```bash
DISPATCHER=/Users/linktrend/Documents/Codex/2026-09-09/files-pasted-by-the-user-i/outputs/cursor-cloud/cursor_cloud.py
python3 "$DISPATCHER" check
python3 "$DISPATCHER" validate /absolute/path/to/PACKET.json
python3 "$DISPATCHER" submit /absolute/path/to/PACKET.json
python3 "$DISPATCHER" poll PACKET_ID
python3 "$DISPATCHER" watch PACKET_ID --seconds 45
```

`check` performs account/model/repository GETs and writes a local sanitized
account snapshot. `validate` performs packet validation without a provider
request. `submit` is a paid/mutating action and is forbidden before founder
approval. `poll`/`watch` are used only for already submitted packet identities;
an uncertain create state is read back, never blindly resubmitted.

## Starting-source publication

Cursor workers can fetch only GitHub-visible bytes. Before a source packet is
submitted:

1. create its GitHub issue and `issue/<number>-<slug>` branch through the
   installed repository tooling;
2. rebase or create it from the exact current protected `development` commit;
3. commit and push all accepted planning inputs needed by that worker,
   including sanitized upstream schemas/fixtures and the exact packet;
4. read back the branch commit and tree from GitHub;
5. put that exact `ref`, `commit` and `tree` in the packet; and
6. invalidate and recreate the packet if the branch advances before dispatch.

Mac-local sibling checkouts, uncommitted files, old releases and planning task
messages are not worker-visible source authority.

## Queue authority transition after approval

The shared dispatcher is currently suspended by
`outputs/queue-control/SUSPENDED`. Its `RESUME-SCOPE.json` presently has no
grant for LiNKsites owner task
`01a088ee-0886-78f2-97af-1924d73ac079`. This is expected before approval.

The first post-approval coordinator action is an atomic, locked scope update
that adds exactly:

```json
"01a088ee-0886-78f2-97af-1924d73ac079": ["linktrend/LiNKsites"]
```

The transaction must hold an exclusive lock on the dispatcher's persistent
`outputs/cursor-cloud/state/.dispatch.lock` continuously until all write,
readback and capacity-reconciliation steps finish. While holding that lock it
must:

1. read the latest `RESUME-SCOPE.json`; reject a symlink, non-regular file,
   malformed document or unsupported structure;
2. record the current file mode, full comparison hash, whether the owner key
   already existed and whether this transaction actually adds the membership;
3. preserve every existing owner, repository membership, top-level field,
   timestamp, objective, mode and unknown key while unioning only the required
   membership;
4. write a regular temporary file in the same directory, preserve the
   refreshed current mode rather than assuming `0600`, flush the file, then
   atomically replace the target and sync its directory where supported;
5. parse, validate and read back the replaced file, proving the intended union
   and preservation of all other state;
6. reconcile current outstanding/writer capacity under the same lock and
   record the sanitized before/after identity and capacity receipt; and
7. leave global `SUSPENDED` in place and release the lock only after all prior
   steps pass. A failed step before replacement writes nothing; a failed
   post-replacement readback invokes the bounded owned rollback below.

Rollback reacquires and continuously holds that same `.dispatch.lock`, reads
and validates the latest scope and current mode, and removes only the
`linktrend/LiNKsites` membership if the transition receipt proves this task
actually added it. It preserves every intervening grant, unknown field,
current mode, global `SUSPENDED` and any owner key that existed before the
transaction. It removes the owner key only if this task created it and the key
is still empty after owned-membership removal. It uses the same same-directory
temporary-file, flush, atomic-replace, directory-sync, parse/readback and
capacity-reconciliation sequence. Pre-change backups and hashes are comparison
evidence only and are never written back over newer shared state.

This queue change is not made during planning. If current structure or owner
membership differs after approval, the coordinator recomputes the additive
transition and stops on an ownership conflict.

## Packet admission contract

Every dispatched packet contains:

- `packet_id`, `owner`, `repository`, `ref`, full 40-character `commit` and
  `tree`;
- one cohesive prompt with objective, required behavior, exclusions, evidence
  and stop conditions;
- literal `allowed_paths` and focused `acceptance_commands`;
- `role` from the dispatcher's accepted role set;
- `admitted: true` and non-empty `admission_evidence` added only after founder
  approval and current dependency/readback checks; and
- `lane_id` and the final approved `lane_plan_sha256` only for simultaneous
  implementation lanes.

The committed template intentionally has `admitted: false`. It is a planning
artifact and must fail the dispatcher's submit validation until post-approval
admission fills exact branch identities, approval evidence and lane-plan hash.

## Execution and review roles

- Coordinator/Gate 0: current LiNKsites task using the installed repository
  process; read-only refresh and issue/branch setup after approval.
- Implementation: Cursor REST, Grok 4.6 Medium, Fast false.
- Source integration: repository Phase Packager/Coordinator and delivery
  controller; implementers do not open or merge PRs.
- Independent source and final operational review: Luna High, read-only,
  separate from implementers and exact-identity bound.
- Live Server03 mutation: one designated LiNKsites deployment owner after the
  immutable source and data-safety gates.

No worker dispatches nested workers. No implementer reviews, merges, promotes
or deploys its own work.

## Capacity and lifecycle

The dispatcher allows at most 20 outstanding jobs and 16 writers, reserving
four places for reviews/downstream work. Those are account ceilings, not a
LiNKsites target. LiNKsites fills only the dependency-ready, path-compatible
lanes in `IMPLEMENTATION-LANES.md`.

The dispatcher normally permits one active writer per repository. Verified
lane-aware admission allows multiple writers only when all packets share the
same owner and lane-plan hash, use different issue branches and lane IDs, and
have literal, non-overlapping, non-exclusive paths. Root files, shared lock
files, broad roots, migrations and generated paths remain exclusive.

Lifecycle:

```text
approved packet -> validate -> submit -> bounded watch/poll
-> retrieve exact result and GitHub checkpoint
-> focused acceptance -> repair or accepted checkpoint
-> consolidation -> one Full Suite -> independent review
-> Phase packaging/controller -> protected promotion
```

`FINISHED` is provider status, not acceptance. A worker result counts only
after exact branch/commit/tree readback, scoped diff inspection, focused checks
and required review. Failed checks create a targeted correction on the owned
branch; they do not cause blind redispatch.
