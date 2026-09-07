# Bounded runtime advisory resolution — 2026-09-07

Scope: issue #476, based on accepted issue #474 commit 1132e63c2de8ad9597b39e9ddbefdfb02430c8d8.
No unrelated framework upgrade, scanner waiver, production mutation, or new
authorization model is included. Production acceptance still requires independent
exact-head review, Full gates, protected promotion and live prerequisite proof.

## Account unlock

GHSA-jg8r-5jh2-v2xj affects Payload 3.87.1. Its collection defaults grant unlock
through `defaultAccess`, which returns `Boolean(req.user)`. The actual unlock
operation consults that rule before selecting the target account by email.

`apps/cms/src/collections/Users.ts` now explicitly binds `access.unlock` to
`manageUsersAccess`, the existing server-side MANAGE_USERS capability used for
user creation/deletion and privileged updates. Unauthenticated callers, ordinary
editors/managers/publishers, unresolved roles, request-body role claims and
site/organization context alone grant no unlock authority. Bootstrap is not an
exception. Existing admin/super-admin and trusted boolean MANAGE_USERS role
grants retain the established global user-management authority; this patch does
not invent a new organization-specific user administration policy.

`users-unlock-access.spec.ts` uses Payload's actual access executor and actual
unlock operation (only database I/O is faked). It proves denial before lookup or
mutation, and privileged reset of the selected account's lockout fields. The
initial 16-case regression had 11 failures on the unchanged parent, before the
explicit rule was added. The final suite includes two operation-level tests.

The upstream package has no published fixed version in the observed advisory.
The package-version audit therefore still reports this one moderate advisory;
the explicit application authorization fixes the affected LiNKsites path. This
is not an audit suppression or a claim that upstream Payload itself was patched.
Trusted server-side `overrideAccess` remains privileged by framework design; no
untrusted request is granted it by this change.

## Targeted transitive patches

| Dependency path | Advisory coverage | Resolution |
| --- | --- | --- |
| Payload → AJV → fast-uri | GHSA-5jgf-p345-68v8, GHSA-f65p-4m7j-42xc, GHSA-fph4-wmhf-6fwf, GHSA-jqff-g426-hqxp | 3.1.5 → 3.1.6 |
| CSS/Babel → Browserslist | GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g | 4.28.1 → 4.28.7 |
| Tailwind → postcss-selector-parser | GHSA-w9m9-85wc-3x92 | 6.1.2 → 6.1.3 |

AJV uses fast-uri for schema URI handling; proving every URI interpretation
unreachable would be weaker than taking the available compatible patch.
Browserslist is reached through build/compiler tooling, not an exposed query API
in this scope, but the available patch also removes dependence on that boundary.
Exact patch overrides and a frozen lockfile resolve the vulnerable dependencies.
Only their graph changes: Browserslist additionally requires newer
baseline-browser-mapping, caniuse-lite, electron-to-chromium and node-releases.
Payload, Next, React, database adapters and unrelated package versions stay fixed.

`runtime-dependency-security.spec.ts` checks actual package resolution from the
CMS consumers, rejects malformed IPv6 through patched fast-uri, and exercises
the CSS helpers. The production audit after the patch reports 0 high, 0 low,
0 critical and 1 moderate (the application-mitigated Payload advisory above).
Frozen installation, full repository tests/builds and independent review remain
mandatory for the exact final candidate; this note alone is not their receipt.

## Sources

- [Payload collection access control](https://payloadcms.com/docs/access-control/collections)
- [Payload advisory](https://github.com/advisories/GHSA-jg8r-5jh2-v2xj)
- [fast-uri maintainer advisory](https://github.com/fastify/fast-uri/security/advisories/GHSA-f65p-4m7j-42xc)
- [Browserslist maintainer advisory](https://github.com/browserslist/browserslist/security/advisories/GHSA-c83g-rgw3-j3cx)
- [Selector parser advisory](https://github.com/advisories/GHSA-w9m9-85wc-3x92)

Source inspection and npm registry/audit readbacks were performed on 2026-09-07.
