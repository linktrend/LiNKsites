# Pre–IDE v2.4 Packager-prep — exact source pins

Recorded from `linktrend/LiNKsites` against `origin/development` at integration time.
No newer tip drift was present on the accepted source refs.

## Integration base

| Field | Value |
| --- | --- |
| Ref | `origin/development` |
| Commit | `d773991729db7a2f9cfbf0d26cd0e3b312efef77` |
| Tree | `0af3cf1f86621d3259e87fe497b5d2c0c2dee5ff` |
| Subject | Merge pull request #158 from linktrend/issue/157-sync-ide-v238-active-workflows |

## Surface A — accepted CI upgrade PR #164

| Field | Value |
| --- | --- |
| PR | https://github.com/linktrend/LiNKsites/pull/164 (OPEN; not merged) |
| Branch | `phase/ci-optimization-c85965d` / `issue/163-audit-and-optimize-linksites-repository-ci-check` |
| Accepted head | `99716bb5506160b871268af37d4bb42e57508fa5` |
| Tree | `48853cf5822adb64a28fd65c277aa03a423bc70e` |
| Merge-base vs development | `d773991729db7a2f9cfbf0d26cd0e3b312efef77` |
| Newer unreviewed tip? | No — remote tip equals accepted head |
| Acceptance note | Independent exact-head technical review comment on PR #164 for this SHA/tree |

## Surface B — open master-template PR #180

| Field | Value |
| --- | --- |
| PR | https://github.com/linktrend/LiNKsites/pull/180 (OPEN; not merged) |
| Branch | `phase/final-linksites-consolidation-9ebd093` |
| Resolved head | `f758632f44661b49d63eb1c33ec213ada17e5150` |
| Tree | `34e562834ed943b83f68efc705029cb6637bef55` |
| Merge-base vs development | `d773991729db7a2f9cfbf0d26cd0e3b312efef77` |
| Newer unreviewed tip? | No — remote tip equals resolved head |
| CI-equivalent tip inside #180 | `8291d3787b1939ff40c514bcf0619c615409c557` (same tree as accepted #164 tip) |
| Product readiness | Draft / non-selectable master-template ownership is complete in-repo; package remains quarantined / non-selectable and is **not** product-ready |

## Surface C — Item5 issue/183 accepted head / closed PR #184

| Field | Value |
| --- | --- |
| Issue | https://github.com/linktrend/LiNKsites/issues/183 (OPEN) |
| Branch | `issue/183-connect-linksites-to-the-five-link-providers` |
| Accepted head | `54f904ccea2e989c35b43ea3688518e9fbd10ea2` |
| Tree | `b1bd381b7b78c414bd062bde93a25e70947e6385` |
| Merge-base vs development | `d773991729db7a2f9cfbf0d26cd0e3b312efef77` |
| Closed PR #184 | https://github.com/linktrend/LiNKsites/pull/184 (CLOSED without merge; head at close `2b35d94a156aada2688e3fef070ea1ab51d4fad5`) |
| Ancestry | Closed #184 tip is an ancestor of accepted Item5 head; accepted head adds gitleaks fixture hardening commits `933707c` and `54f904c` |
| Newer unreviewed tip? | No — remote tip equals accepted head |

## Deterministic integration order used

1. Merge accepted CI tip `99716bb…` onto development.
2. Cherry-pick #180 commits after CI-equivalent `8291d37…` through `f758632…` (exclude duplicate CI cherry lineage; preserve accepted #164 CI tip identity).
3. Merge accepted Item5 tip `54f904c…`.
