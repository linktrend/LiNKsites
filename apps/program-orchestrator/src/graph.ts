import type { IssueDefinition } from './contracts.ts'

export const PROGRAM_ID = 'linksites-first-site-private-demo'
export const MODULE_ID = 'module-first-site-factory'

export const W2_02_GRAPH: readonly IssueDefinition[] = [
  { issueId: 'lead-pull-validate', moduleId: MODULE_ID, phaseId: 'phase-intake', title: 'Pull and validate lead/research', executorKind: 'lead.validate', executorVersion: '1.0.0', dependsOn: [] },
  { issueId: 'program-claim-create', moduleId: MODULE_ID, phaseId: 'phase-intake', title: 'Atomically claim and idempotently create Program', executorKind: 'program.claim', executorVersion: '1.0.0', dependsOn: ['lead-pull-validate'] },
  { issueId: 'package-qualify', moduleId: MODULE_ID, phaseId: 'phase-intake', title: 'Qualify package and vertical compatibility', executorKind: 'package.qualify', executorVersion: '1.0.0', dependsOn: ['program-claim-create'] },
  { issueId: 'foundation-reserve', moduleId: MODULE_ID, phaseId: 'phase-foundation', title: 'Reserve foundation/template inventory', executorKind: 'foundation.reserve', executorVersion: '1.0.0', dependsOn: ['package-qualify'], externalBoundary: 'factory-catalog' },
  { issueId: 'library-resolve', moduleId: MODULE_ID, phaseId: 'phase-foundation', title: 'Resolve exact approved LiNKlibraries artifact', executorKind: 'library.resolve', executorVersion: '1.0.0', dependsOn: ['package-qualify'], externalBoundary: 'library-client', irreversible: true },
  { issueId: 'site-spec-manifest', moduleId: MODULE_ID, phaseId: 'phase-foundation', title: 'Build site specification and assembly manifest', executorKind: 'site.compose', executorVersion: '1.0.0', dependsOn: ['foundation-reserve', 'library-resolve'] },
  { issueId: 'information-architecture-copy', moduleId: MODULE_ID, phaseId: 'phase-content', title: 'Create lead-specific information architecture and copy', executorKind: 'content.copy', executorVersion: '1.0.0', dependsOn: ['site-spec-manifest'], externalBoundary: 'working-content' },
  { issueId: 'media-provenance', moduleId: MODULE_ID, phaseId: 'phase-content', title: 'Source and process media with provenance', executorKind: 'content.media', executorVersion: '1.0.0', dependsOn: ['site-spec-manifest'], externalBoundary: 'working-content' },
  { issueId: 'working-content-assemble', moduleId: MODULE_ID, phaseId: 'phase-content', title: 'Assemble and validate working-content version', executorKind: 'content.assemble', executorVersion: '1.0.0', dependsOn: ['information-architecture-copy', 'media-provenance'], externalBoundary: 'working-content', irreversible: true },
  { issueId: 'content-quality-gates', moduleId: MODULE_ID, phaseId: 'phase-content', title: 'Run content, schema, quality, security/privacy, and asset gates', executorKind: 'content.gates', executorVersion: '1.0.0', dependsOn: ['working-content-assemble'] },
  { issueId: 'payload-draft-promote', moduleId: MODULE_ID, phaseId: 'phase-cms', title: 'Promote exact accepted version to Payload draft', executorKind: 'cms.promote-draft', executorVersion: '1.0.0', dependsOn: ['content-quality-gates'], externalBoundary: 'payload-cms', irreversible: true },
  { issueId: 'payload-readback-parity', moduleId: MODULE_ID, phaseId: 'phase-cms', title: 'Run CMS read-back parity gate', executorKind: 'cms.readback-gate', executorVersion: '1.0.0', dependsOn: ['payload-draft-promote'], externalBoundary: 'payload-cms' },
  { issueId: 'private-preview-create', moduleId: MODULE_ID, phaseId: 'phase-preview', title: 'Publish only to private preview environment', executorKind: 'preview.private-create', executorVersion: '1.0.0', dependsOn: ['payload-readback-parity'], externalBoundary: 'frontend-deployment', irreversible: true },
  { issueId: 'private-preview-render', moduleId: MODULE_ID, phaseId: 'phase-preview', title: 'Render and validate the complete private site', executorKind: 'preview.render-validate', executorVersion: '1.0.0', dependsOn: ['private-preview-create'], externalBoundary: 'frontend-deployment' },
  { issueId: 'preview-evidence-capture', moduleId: MODULE_ID, phaseId: 'phase-preview', title: 'Capture functional, visual, SEO, accessibility, and privacy evidence', executorKind: 'preview.evidence', executorVersion: '1.0.0', dependsOn: ['private-preview-render'] },
  { issueId: 'crm-completion-emit', moduleId: MODULE_ID, phaseId: 'phase-completion', title: 'Emit one CRM-shaped completion record', executorKind: 'completion.emit', executorVersion: '1.0.0', dependsOn: ['preview-evidence-capture'], externalBoundary: 'completion-event', irreversible: true },
]

export const GRAPH_EXPORT = {
  program: PROGRAM_ID,
  hierarchy: 'Module > Phase > Issue > Run',
  module: { id: MODULE_ID, title: 'First-site private demo factory' },
  phases: ['phase-intake', 'phase-foundation', 'phase-content', 'phase-cms', 'phase-preview', 'phase-completion'],
  issues: W2_02_GRAPH,
  excluded: ['sold-site-public-activation', 'commercial-payment', 'commercial-erp', 'workflow-marketplace', 'hosted-infrastructure', 'live-credentials'],
}
