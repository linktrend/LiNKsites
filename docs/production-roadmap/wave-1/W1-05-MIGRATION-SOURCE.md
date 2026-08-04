# W1-05 master-template migration boundary

`marketing-smb-v1` remains physically implemented at
`apps/web-master/src/templates/marketing-smb-v1.ts` during Wave 1. W1-05 adds
the LiNKsites consumer contract, immutable consumption receipt, and offline
executable fixture; it does not claim that the current external LiNKlibraries
catalog already contains this entry.

The consumer contract points to the real template source path as provenance
and is exercised against an explicitly offline executable fixture under
`packages/factory-catalog/tests/fixtures/linklibraries/marketing-smb-v1/`.
That fixture proves the consumer protocol only; it is not evidence that the
external catalog already contains an approved production entry.
W2-04 must admit the substantive `marketing-smb-v1` artifact to the governed
LiNKlibraries repository and replace the migration-source receipt with the
exact accepted LiNKlibraries commit and asset checksums.

No LiNKlibraries files are changed by this packet. The currently inspected
external catalog has no `marketing-smb-v1` entry, and this packet supplies no
exact external repository path/base/branch boundary for creating one.
