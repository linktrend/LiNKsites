# marketing-smb-v1 offline Library fixture

This fixture mirrors the current LiNKlibraries schema version 1. LiNKsites
selects the executable entrypoint and test file separately because the
authoritative external entry metadata does not define an `exportPath` field.
The fixture is offline so validation never depends on GitHub or a mutable
branch.

The fixture's approved status is test data for the pinned-consumption flow. It
does not assert that `marketing-smb-v1` is currently present or approved in
the external LiNKlibraries catalog. The external entry is not admitted yet;
W2-04 owns that admission.
