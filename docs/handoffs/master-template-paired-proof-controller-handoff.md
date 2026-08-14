# Master Template Type 1 — independent proof controller handoff

This handoff is for an independent Coordinator/Controller. The implementer must not open, approve, merge, or promote the proof PR.

## Exact inputs

- LiNKsites consumer branch: `issue/167-extract-linksites-master-template-into-linklibra`
- LiNKsites consumer checkpoint: `6776e86d61ae581f467b2b00a2de62c9640a5b8f`
- LiNKsites consumer tree: `ab2c88ede89e77cf9eb6e52dbee8b5a3a3b18e24`
- LiNKlibraries candidate commit: `49586ba09ea2bb61a1f49825d6124f95f13c4447`
- LiNKlibraries candidate tree: `4dc7dc3497461cf592b351eb5f75abe676d8e632`
- Candidate dependency-lock SHA-256: `59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23`
- Candidate release receipt SHA-256: `75ab0ab5d29fce058438d586eb222924e3046d718743c3cda6a2e6a49fbef2d6`
- Candidate manifest SHA-256: `1d06c150c085d133657d86616e6668fd6f61e6d630b1cedde98bf91fc4377d93`
- Candidate payload SHA-256: `f8996da4561c8e31438ba51136d22070190bace550ba22bd83bb200d8fc4af3e`
- Candidate inventory SHA-256: `1fd760c9d2c327429ec6c124f6f5927db82182bb40e8962f642c78a05fb771bb`
- Candidate artifact tree SHA-1: `8ef8be911b976ede1810b2a7cfc44a29dded239c`

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
