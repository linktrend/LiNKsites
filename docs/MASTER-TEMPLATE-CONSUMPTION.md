# Master template consumption

LiNKlibraries is the owner of the reusable website template. LiNKsites only
reads an exact, pinned release while building a site; it does not copy the
template into this repository or edit the Library release.

For a Revision 2 build, configure all of these values:

```text
LINKSITES_TEMPLATE_FORMAT=revision2
LINKSITES_TEMPLATE_ID=master-template-type-1
LINKSITES_TEMPLATE_VERSION=1.0.0
LINKSITES_LINKLIBRARIES_ROOT=/path/to/the/pinned/LiNKlibraries/checkout
LINKSITES_LINKLIBRARIES_COMMIT_SHA=<40-character-provider-commit>
LINKSITES_LINKLIBRARIES_TREE_SHA=<40-character-provider-tree>
LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256=<64-character-lock-digest>
LINKSITES_LINKLIBRARIES_RECEIPT_PATH=/path/to/the/provider/receipt.json
```

The consumer checks the catalogue record, release manifest, inventory,
dependency lock, receipt, and every materialized file. It refuses to render a
release that is missing, changed, not selectable, or not compatible. The
current `master-template-type-1@1.0.0` provider package is intentionally
quarantined/non-selectable while the visual master template is completed; this
is a deliberate fail-closed state, not a production approval.

The old `marketing-smb-v1` fixture remains only for the disposable W2-04
compatibility proof and is not the master-template identity.
