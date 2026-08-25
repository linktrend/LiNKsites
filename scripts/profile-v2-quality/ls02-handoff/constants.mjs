export const ISSUE = 300
export const PACKET = 'LS-02'
export const REPOSITORY = 'linktrend/LiNKsites'
export const CANDIDATE_PARENT = Object.freeze({
  commit: '2ba3bd70244061985a3896e748fb75e92dfb6c69',
  tree: '606fcb986b8eb9af476aea369d94990357ff9681',
})
export const OWNED_PATHS = Object.freeze([
  'docs/evidence/ls02/handoff-successor/**',
  'scripts/profile-v2-quality/ls02-handoff/**',
])
export const FORBIDDEN_CLAIM_PATTERN = /\b(?:accepted|conformant|production|hosted|provider bytes|copied bytes)\b/i
export const GIT_SHA = /^[0-9a-f]{40}$/

export function isOwnedPath(file) {
  return file.startsWith('docs/evidence/ls02/handoff-successor/') ||
    file.startsWith('scripts/profile-v2-quality/ls02-handoff/')
}
