# LiNKsites Server03 signal catalog (LSOPS-01)

This catalog names the signals for exactly one `linksites-foundation`
installation. Scrape labels may carry `release_sha`, `service`, and
`organisation` when those values are non-secret identity. Never log tokens,
passwords, customer payloads, personal data, private URLs, or credential
values.

Healthy state unless noted: metric present, value as in the Expected column,
and the matching alert not firing.

| Signal | Meaning | Inspect (names/paths only) | Threshold / `for` | Expected healthy | Response / rollback |
|---|---|---|---|---|---|
| `up{job="linksites-server03-foundation"}` | Orchestrator metrics target | `docker compose --project-name linksites-foundation ps program-orchestrator` then `wget -qO- http://program-orchestrator:3000/metrics` from the internal network | `== 0` for 5m | `1` | Do not restart unrelated projects. Recreate only `program-orchestrator` from the current five-digest manifest. STOP if the digest is unknown. |
| `linksites_program_active_issues` | Ledger issues currently active | `wget -qO- http://program-orchestrator:3000/metrics` | Missing for 5m; `> 8` for 30m | Present; usually `0` after drain | Pause intake. Inspect ledger under `/var/lib/linksites/program`. Do not replay dead letters. |
| `linksites_program_retries_total` | Retry counter | same `/metrics` | increase over 15m, pending 15m | Not steadily increasing | Pause intake, keep outbox, retry only a ready Issue. |
| `linksites_program_dead_letters_total` | Dead letters plus outbox dead letters | same `/metrics` | `> 0` for 1m | `0` | Do not replay blindly. Preserve receipt, classify, owner decision. |
| `linksites_program_manual_attention_total` | Manual attention queue | same `/metrics` | `> 0` for 1m | `0` | Keep private. Escalate with correlation ID only. |
| `linksites_program_completion_emits_total` | Completion emits | same `/metrics` | informational | Non-decreasing after a successful private run | Not an alert by itself. |
| `linksites_release_digest_match` | Textfile: running five images match the bound manifest | `docker compose --project-name linksites-foundation images` compared to the release manifest; write `1` or `0` to `/var/lib/linksites/metrics/linksites.prom` | `== 0` for 5m | `1` | STOP new work. Roll back to the prior five-digest manifest. Do not start mixed digests. |
| `linksites_container_healthy` | Textfile: Docker health of each long-running service | `docker inspect --format '{{.State.Health.Status}}' <container>` for `payload`, `web-master`, `autowork-worker`, `program-orchestrator` | `== 0` for 5m | `1` per service | Recreate that service only. STOP after two failed recreates. |
| `linksites_container_restarts_total` | Textfile/cAdvisor restart count | `docker inspect --format '{{.RestartCount}}'` | increase `> 2` in 15m, pending 10m | No restart loop | Stop the looping service. Do not delete volumes. |
| `linksites_migration_job_running` | One-shot migrate still running | `docker compose --project-name linksites-foundation ps supabase-migrate payload-migrate` | `== 1` for 30m | `0` after success | STOP app traffic. Do not edit applied migrations. Do not start long-running services on a stuck migrate. |
| `linksites_payload_migrations_match` | Payload schema matches bound index | `payload migrate --status` inside the worker image; compare checksums from the release manifest | `== 0` for 5m | `1` | STOP. Forward-only compatible migration or isolated restore. Never roll schema backward in production. |
| `linksites_platform_migration_receipt_match` | Authorized Platform SHA receipt in `lsites_ledger.platform_migration_receipts` | `psql` against the LiNKsites CMS URI selecting only that receipt table | `== 0` for 5m | `1` when Platform is ready | HOLD. Do not dump or mutate the `platform` schema. Obtain Platform authority. |
| `probe_success{job="linksites-readyz"}` | Blackbox HTTP readiness | Probe only internal `http://payload:3000/api/readyz`, `http://web-master:3000/api/readyz`, `http://program-orchestrator:3000/readyz` | `== 0` for 5m | `1` | Worker has no HTTP readyz; use `linksites_container_healthy`. Recreate the failing service. |
| `linksites_payload_ready` / `linksites_postgres_ready` | Payload `/api/readyz` and Postgres connectivity from CMS | same readyz plus `pg_isready` through the CMS URI host only | `== 0` for 5m | `1` | Keep preview private. Restore only into an isolated target after checksums. |
| `probe_success{job="linksites-tls"}` | Private CMS and preview TLS | Blackbox HTTPS to the private host names without query tokens | `== 0` or cert `< 14d` for 15m | `1` and expiry `>= 14d` | Keep Traefik privacy middleware. Do not publish DNS. |
| `linksites_preview_noindex` | Private preview `x-robots-tag` includes noindex | `curl -sI` the stable `/en/demo` path with the application preview header inside the web-master network; record only 0/1 | `== 0` for 5m | `1` | Keep middleware enabled. Do not log the token or URL. |
| `linksites_unauthenticated_preview_denied` | Unauthenticated preview is denied | Probe the preview host without the preview header; expect non-200 | `== 0` for 5m | `1` | Disable the affected Traefik router. Do not open a public route. |
| `linksites_autowork_mode_live` | `1` if `LINKSITES_AUTOWORK_MODE=live` | Redacted config fingerprint only | live without admission is critical | `0` for the first private website | Remain `manual` until an admitted live handoff exists. |
| `linksites_autowork_live_admitted` | Live Autowork handoff admitted | Runtime contract result, never secret values | used with mode | `1` only after admission | HOLD live Autowork. |
| `linksites_platform_state_ready` | `1` if Platform `ready` | `LINKSITES_PLATFORM_STATE` fingerprint | `== 0` for 15m after intended run | `1` for operational acceptance | HOLD migrations/startup. Disposable proof does not supply authority. |
| `linksites_provider_ready` | Native v2 provider admitted | `LINKSITES_TEMPLATE_RELEASE_STATE=ready` plus receipt match | publishing while `0` is critical | `0` is expected while deferred | Deferred is not a failure. STOP publishing attempts. |
| `linksites_template_publishing_attempted` | Textfile: intake/publishing attempted | Orchestrator/web-master logs classified without payloads | `1` while provider HOLD | `0` while deferred | STOP intake. |
| `node_filesystem_avail_bytes` | Host disk | `df -h / /var/lib/linksites /var/lib/docker` | `< 15%` for 15m | `>= 15%` | Free only LiNKsites restore leftovers matching `linksites-restore-rehearsal-*`. Never delete the production volume. |
| `container_memory_working_set_bytes` | cAdvisor memory | Compose project `linksites-foundation` only | `> 90%` limit for 15m | `< 90%` | Recreate that service. Do not raise limits in this packet. |
| `linksites_backup_last_success_timestamp_seconds` | Last successful backup | textfile after restic snapshot | age `> 90000s` for 15m | age `< 25h` | Re-run backup. STOP if encryption secret missing. |
| `linksites_backup_last_attempt_result` | `1` success / `0` fail | same textfile | `== 0` for 15m | `1` | Re-run once. Preserve the failed artifact. Do not prune. |
| `linksites_restore_rehearsal_last_success_timestamp_seconds` | Isolated restore proof | Only after an isolated project restore, never production | age `> 31d` for 1h | age `< 31d` | Schedule isolated restore. Do not overwrite production. Absence of Docker here is not a success receipt. |
