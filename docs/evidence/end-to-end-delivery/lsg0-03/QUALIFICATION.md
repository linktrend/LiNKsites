# LSG0-03 qualification (Issue 549)

**Status: HOLD** (not packet PASS)

This packet consumed the protected LiNKlibraries `marketing-smb-v1` identity `0704dbef0871216dee5c4b85b3e2783823c21edb` / tree `183e834bf7888a5a6e675a1232a1f979c8991a42`. Provider publication (Library-local selectable admission on LiNKlibraries) is distinct from this consumer proof. LiNKlibraries was not edited. Deployment, production, Server03, and image publication are not claimed.

## Identities

| Role | Repository | Ref / checkout | Commit | Tree |
| --- | --- | --- | --- | --- |
| Writer start | linktrend/LiNKsites | issue/549… (cloud writer `cursor/linksites-protected-marketing-smb-consumer-549-4259` at the same SHA) | `fba2ed08d5cf3a16ca691da6eec707d584153a7f` | `395d4dc07780ffee977be7f5d6469b06189f1475` |
| Read-only source | linktrend/LiNKlibraries | `development` at supplied commit (detached) | `0704dbef0871216dee5c4b85b3e2783823c21edb` | `183e834bf7888a5a6e675a1232a1f979c8991a42` |

Cached checkouts already matched the supplied commits/trees. Fetched `origin/issue/549-consume-protected-marketing-smb-provider-handoff` and `origin/development` matched. The bound libraries tip was not substituted.

## Required outputs

| ID | Required output | Classification |
| --- | --- | --- |
| LSG0-03-R1 | Current exact **selectable** `marketing-smb-v1` with qualification/admission and immutable digests | **completed** (Library-local selectable on protected 0704dbe; not production) |
| LSG0-03-R1-observation | Inspect lifecycle/selectability/admission/digests on the supplied tree | **completed** |
| LSG0-03-R1-consumer | Materialize/bind/restart/tamper through the LiNKsites consumer boundary | **completed** (production selection still fail-closed) |
| LSG0-03-R2 | Exact **admitted** Master Website Template A1/A2/A3 and A/B/C/L handoff | **missing and needs work** |
| LSG0-03-R2-observation | Inspect current release, pointer, layouts/plans, digests, receipts | **completed** (`current.json` absent; draft/non-selectable) |
| LSG0-03-R2-candidate-bytes | 2.0.0 A1/A2/A3 packs and A/B/C/L plans as source input | **done but requires testing/fixing** |

## Protected facts

`marketing-smb-v1` `entry.json` SHA-256 `bf7efdbe2cc281bbfb193aab4554a660648da5c2c4baeb40f078d7ad110bb9b7`, git tree `d146699d8d03d6f4821fe7aa57d449678c3ea170`, catalog SHA-256 `d8e9b6d7616d98f08890bb5db08a1c0aad93775c54f7eac880380285ff1ba23e`. `state=usable`, `selectable=true`. Library admission is `library_local_selectable`. LiNKsites renderer and Payload compatibility remain unproven.

The obsolete quarantined/non-selectable assumption is replaced **only** for this protected identity. The 5188aaf planning pin copy stays quarantined/non-selectable.

Master Website Template still has no `current.json` on this tree. A1 remains a separate lane and was not claimed as admitted by this packet.

## Why HOLD

LSG0-03 packet PASS requires both providers selectable/admitted for their intended consumer use. `marketing-smb-v1` is now Library-local selectable with consumer bind proof. MWT A1/A2/A3 and A/B/C/L remain draft/non-selectable.

## Lean review

Founder-approved lean policy applies. No independent reviewer. Replacement proof: exact identities, GitHub byte hashes, focused tests, provider tests on the read-only checkout, secret scan, `git diff --check`.
