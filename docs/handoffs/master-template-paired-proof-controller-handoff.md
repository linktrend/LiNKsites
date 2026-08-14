# Master Template Type 1 — independent proof controller handoff

This handoff is for an independent Coordinator/Controller. The implementer must not open, approve, merge, or promote the proof PR.

## Exact inputs

- LiNKsites consumer branch: `issue/167-extract-linksites-master-template-into-linklibra`
- LiNKsites consumer checkpoint: `6776e86d61ae581f467b2b00a2de62c9640a5b8f`
- LiNKsites consumer tree: `ab2c88ede89e77cf9eb6e52dbee8b5a3a3b18e24`
- LiNKlibraries candidate commit: `19a5d85db5bd1eca8971eb349ed605cfe5342b34`
- LiNKlibraries candidate tree: `2eeefac865cf572d552d18a217a8604a6ea0075f`
- Candidate dependency-lock SHA-256: `59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23`
- Candidate release receipt SHA-256: `cd9991308a3ee783f5f0cefe854d626bfdac9ae9d3c60bc65c2f8f5b4a86c576`
- Candidate manifest SHA-256: `80d9c1f7e65695f5f3175daacf65144446ce95943dff88484f511cf0d7d44418`
- Candidate payload/inventory projection SHA-256: `f36b5dac727536fba6e95eac2134f61703b74fa543e8c4d2cc2ca0d9df52bd84`
- Candidate inventory file SHA-256: `ba504bec33361e3e7bef5f26c9767c0e1ff37070347986d57d8d54a0974fc6ff`
- Candidate artifact tree SHA-1: `4dce4fd9d6a386be38a5da325183ee948e99976`

The provider candidate is intentionally `draft / non_selectable / unknown`; the consumer must not promote or locally alias it.

## Hosted proof

Run the workflow **LiNKlibraries master-template paired proof** from this exact consumer head, passing the provider commit, provider tree, and dependency-lock digest above. The workflow checks out both repositories, installs the declared dependencies, starts disposable Supabase/Payload services on a GitHub-hosted runner, installs Chromium, and runs:

```text
scripts/master-template-paired-proof.sh
```

The script first records exact candidate materialization and receipt persistence, production draft rejection, missing-file, missing-content, tamper, and provider-token mutation probes. It then runs the existing Payload/browser proof lane with the master template selected and the provider token CSS applied. Local Docker absence is not evidence; only the hosted workflow artifacts count for the browser portion.

## Required controller decisions

1. Verify the workflow ran against the exact consumer SHA/tree and provider SHA/tree above.
2. Require PASS artifacts for the provider-controlled visible token/layout, required routes, real disposable Payload content, desktop/mobile, accessibility/link checks, SEO/privacy, private-preview isolation, missing-content/file, and tamper rejection.
3. If any browser or hosted service check is skipped or fails, mark the proof HOLD. Do not admit the provider or merge the consumer.
4. Return the exact proof receipt and artifact URLs to the existing **LiNKlibraries - LiNKsites Website Template** task for independent rights review and provider admission.
5. Provider must land through LiNKlibraries development → staging → main first. Only after that protected promotion may a consumer follow-up pin the admitted release and rerun invalidated final checks.

## Current local evidence

The exact candidate/static probes PASS. The local Payload/browser attempt was intentionally not counted: Docker Desktop was unavailable. The consumer Next build now passes after the focused extension-resolution repair; the regression test is `packages/factory-catalog/tests/workspaceImportResolution.spec.ts`.
