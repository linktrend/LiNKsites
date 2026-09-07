# Issue 480 handoff — deferred Server03 provider identity repair

This handoff requests a fresh independent Luna High review of the Issue 480
successor checkpoint. It does not authorize a Phase PR, merge, provider
admission, deployment, VPS operation, or staging/main promotion.

## Exact review boundary

- Repository: `linktrend/LiNKsites`
- Issue: `#480`
- Branch: `issue/480-repair-issue-480-deferred-server03-provider-iden`
- Review base commit: `4b2997709d8a0805f904a665ad3ee3b77fbdd888`
- Review base tree: `ee868c5bcf555487e6edd864106773edaeb6cf38`
- Failed candidate under repair: `55f0e2f89eff5472f2698221d6b305a1477667ad`

The final candidate commit and tree must be read back from the pushed issue
branch. Review is valid only against that exact candidate and the exact base
above.

## Repaired Issue 480 blockers

- Deferred native Revision 2 Server03 remains provider-independent and does not
  mount or claim an unfinished website template; its platform readiness and
  infrastructure acceptance boundaries remain explicit.
- Selecting a template now requires provider commit and tree pins through the
  orchestrator and materializer.
- Ready-mode materialization and orchestrator health verify the mounted
  provider checkout `HEAD` and `HEAD^{tree}` exactly, rather than accepting a
  merely present commit object or a stale tree.
- Adversarial deployment coverage includes absent provider in deferred mode,
  commit-object-present/checkout-HEAD mismatch, and checkout-tree mismatch.

## Review and promotion boundary

Do not use providers or credentials, change servers, DNS, or protected
branches, deploy, open or merge an implementer PR, or promote a Phase. The
independent review must issue a fresh verdict against the exact pushed
candidate; only the governed coordinator/controller may perform later Phase
promotion after all required approvals and receipts exist.

