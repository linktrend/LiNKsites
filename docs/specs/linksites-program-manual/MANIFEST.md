# LiNKsites Program Manual — Ingestion Manifest

**Purpose:** This directory holds a durable, versioned, verbatim copy of the LiNKsites
Program Manual (Sections 1–24), ingested per manual §85. This copy — not the source
Google Drive file — is the authoritative input for all LiNKsites audit, planning, and
implementation work performed by any agent or cloud session going forward.

## Provenance

- **Source path (local, at ingestion time):**
  `/Users/linktrend/Library/CloudStorage/GoogleDrive-info@linktrend.media/My Drive/LiNKdrive/Manuals/LiNKtrend Studio/LiNKsites Program Manual/`
- **Ingested by:** Cursor agent session, Combined Trigger 2 (PRD in hand) + Trigger 3
  (existing software), Step 0 (manual §85).
- **Ingestion date:** 2026-07-13
- **Method:** Verbatim byte-for-byte copy (`cp`), followed by `diff` verification of
  every file (all 24 files confirmed identical, zero mismatches) and SHA-256 digest
  capture for tamper detection / future-drift detection.
- **Authority order:** Per manual Section 24 §3 — this manual is the reconciled
  current doctrine for LiNKsites and takes precedence over any PRD, spec, README
  claim, or architecture note already in the LiNKsites repo. Where the manual and
  repo docs disagree, the manual wins; repo docs are historical evidence only.

## File manifest

See `MANIFEST.csv` for the machine-readable version (filename, bytes, sha256).

| # | File | Bytes | SHA-256 |
|---|------|------:|---------|
| 01 | executive_definition_purpose_and_doctrine | 32,193 | `5acd44f823fe03c67f8a65b58f03e1537d062881be582ef138e585378de73cee` |
| 02 | scope_boundaries_actors_and_program_relationships | 34,593 | `a774fd5c0875da083e27832d6fc09e8e00bffa598dd5d30d8b06529dfbc448c2` |
| 03 | product_customer_outcomes_tiers_and_commercial_assumptions | 26,818 | `68f9d4bd1e09e5c75e8c0965e89b39d6d71c04f1e3ea988dd0822ee99eea3049` |
| 04 | end_to_end_lifecycle_and_program_state_model | 30,952 | `cc14adcd31a1acde2f011127c5ff316a585820af78bcf44b82e41563c657c943` |
| 05 | program_modules_and_major_handoffs | 36,782 | `36dc684ee9a4c8590da6961b0c2fa848a7e0eac0082cc6f4ed7d41c881f77f38` |
| 06 | design_intelligence_catalog_tokens_and_visual_variation | 27,047 | `0562c80b62c49eaa4c93bdad11d6926c7092d716e8739aaae8ef4d2fa17110b3` |
| 07 | component_registry_frontend_structure_and_deterministic_assembly | 38,769 | `1f5b939be50063f42a13a5ac6ee7f36d25f7106641f8e1617bd57e1ee0f1c29e` |
| 08 | vertical_kits_tier_specifications_and_reusable_site_foundations | 44,970 | `36e69cd9654a22b7ef47321c70dfe61e08aa4204cddc3e87c6d7500a2a17918f` |
| 09 | lead_research_inputs_site_specifications_and_prospect_adaptation_contracts | 41,032 | `3c059c95df2e98b74031c25e447cbbf55357fc4360d1a7c6d2ac2b175b5eea35` |
| 10 | preview_inventory_and_build_first_sell_later_production_model | 41,359 | `0402f8dfd0d59dee42e96cc337938edd900da6a4c9fc2f955cd67a8f863bc7a4` |
| 11 | copy_images_media_provenance_and_asset_creation_workflows | 41,670 | `00edea13144a04536825659b34c257dc90d36aaaa97154e913bc2efe1059de4b` |
| 12 | supabase_working_layer_payload_draft_published_layers_and_content_promotion | 43,555 | `e5bebde2fc25ced7417743b140c36282c23b9b66ec32dc7ab46f49c9337aad6e` |
| 13 | preview_generation_validation_deployment_analytics_and_recycling | 38,462 | `3274435b9f3ada754076f63e1324888e674836a6393e97759e71cd6294aee942` |
| 14 | paid_order_intake_customer_finalization_approval_and_launch_certification | 39,025 | `990e8b3db484618bcd185a7d3d4d889db712cec9e5198940e5d02c76a72ff995` |
| 15 | hosting_topology_frontend_runtime_cloudflare_traefik_and_regional_scaling | 37,688 | `6adc59e39ea4988bfc762f44c2c4940a2425cae16c54b37e0ce3b1831ed87996` |
| 16 | autonomous_hosting_operations_monitoring_recovery_backup_and_restoration | 61,833 | `40aa6793169076ef1f28f9e10c88f3a7a16502d3900b4a6eabf512361ef4a083` |
| 17 | domains_dns_tls_forms_messaging_and_external_service_integrations | 60,325 | `67ac64133a23816a20b7551a31fd064c81ad36f8a26b91c759bf21aaf3f0863f` |
| 18 | security_tenant_isolation_secrets_access_control_and_data_protection | 67,491 | `c9f8193813061102790ca774ccc1af260657b9307ef4a2237f8b85ea67b56994` |
| 19 | quality_gates_testing_accessibility_performance_seo_and_visual_verification | 58,876 | `985e04eb8ad9d1e178e4e12111077bf1f9772ae3374e2478150adfeb766a17ae` |
| 20 | issues_runs_executors_model_routing_idempotency_retry_and_compensation | 61,500 | `6fc486c758befb624829fe6a2168aca93153ce4d850f96363f2c3985f229f3c5` |
| 21 | cross_program_contracts_with_linktrend_sales_odoo_stripe_and_shared_services | 74,289 | `60939b828c33946653621c25f831a8be7f12c654a66e64ffc9ec2c29b8601d80` |
| 22 | openclaw_oversight_exceptions_authority_levels_and_human_intervention | 50,739 | `71656204fcdb9d593db8ed823a30561a64850cd0e85f9928646068c3599d2beb` |
| 23 | observability_cost_accounting_capacity_metrics_and_continuous_improvement | 47,974 | `3767b9105b8a95b0b391ae15aba7d50894e1ae8e157830ddc733bac27872ac66` |
| 24 | repository_audit_implementation_roadmap_acceptance_criteria_and_glossary | 56,989 | `c61dff0e248ce48815cf7cad70815d8afd9bef030744a5fab667d0b814ae2bd2` |

**Total:** 24 files, verified identical to source via `diff` (zero mismatches).

## Regeneration

To re-verify or re-generate this manifest:

```bash
cd docs/specs/linksites-program-manual
{ echo "filename,bytes,sha256"; for f in *.md; do sz=$(stat -f%z "$f"); h=$(shasum -a 256 "$f" | awk '{print $1}'); echo "$f,$sz,$h"; done; } > MANIFEST.csv
```

## Versioning note

If the Program Manual is revised in the future, ingest the new version into a sibling
directory (e.g. `linksites-program-manual-v2/`) rather than overwriting this one, and
update the "current version" pointer in the audit deliverables. Do not silently
overwrite a prior ingested version — the decision/contradiction register and roadmap
traceability depend on being able to cite the exact manual version a decision was made
against.
