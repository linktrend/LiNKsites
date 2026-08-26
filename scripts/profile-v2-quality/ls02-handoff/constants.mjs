export const ISSUE = 300
export const PACKET = 'LS-02'
export const REPOSITORY = 'linktrend/LiNKsites'
export const CANDIDATE_PARENT = Object.freeze({
  commit: 'fd36e3084ddbd26356e3c12883c8754003d671ce',
  tree: 'b0772be140486124362ee9bba4eb7d4447ecd227',
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
