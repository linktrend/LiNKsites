export const ISSUE = 300
export const PACKET = 'LS-02'
export const REPOSITORY = 'linktrend/LiNKsites'
export const CANDIDATE_PARENT = Object.freeze({
  commit: '02ebf5d8710c50c1f2c390989239f0baf916ba97',
  tree: 'fb427d30ea7c3e7060fc9cc1a63a1110266dd755',
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
