# Rollback contract

## Phase candidate identity

- Branch: `phase/pre-ide-v24-accepted-consolidation`
- Integration commit (pre-handoff-doc): `16e384bcd4386eeca920fd0aa1b0b12677ba62a2`
- Safe rollback target (unchanged integration base): `origin/development` = `d773991729db7a2f9cfbf0d26cd0e3b312efef77`

## If the phase branch must be abandoned before Packager opens a PR

1. Do **not** merge the phase branch.
2. Leave `origin/development` untouched.
3. Optionally delete the remote phase branch after Principal acknowledgment:
   - `git push origin --delete phase/pre-ide-v24-accepted-consolidation`
4. Independently accepted source refs remain intact and are the recovery sources:
   - CI: `99716bb5506160b871268af37d4bb42e57508fa5` (PR #164)
   - Master-template: `f758632f44661b49d63eb1c33ec213ada17e5150` (PR #180)
   - Item5: `54f904ccea2e989c35b43ea3688518e9fbd10ea2` (issue/183)

## If a future Packager PR from this phase is opened and must be withdrawn

1. Close the draft PR without merge (Packager / Principal).
2. Do not force-push `development`.
3. Re-integrate later only from the three accepted tips above onto the then-current `origin/development` (re-resolve bases; do not assume this phase tip remains valid after development moves).

## If accepted content cannot be preserved during a future re-integration

Stop with exact **HOLD**. Do not invent prefer-incoming resolutions across unrelated surfaces. Rebuild from the three pinned tips in the same deterministic order.
