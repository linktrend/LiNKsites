import type { ProgramLedger } from '../src/ledger.js'
import type { HierarchySubjectRef } from '../src/types.js'

export async function canonicalEvidence(ledger: ProgramLedger, subjectType: 'issue' | 'phase' | 'module' | 'program', subjectId: string, orgId: string, identity: Omit<HierarchySubjectRef, 'subjectType' | 'subjectId' | 'orgId'> = { programId: subjectType === 'program' ? subjectId : '' }) {
  const issue = subjectType === 'issue' ? await ledger.getIssue(subjectId) : null
  const subject: HierarchySubjectRef = { subjectType, subjectId, orgId, programId: issue?.programRef ?? identity.programId, moduleId: issue?.moduleRef ?? identity.moduleId, phaseId: issue?.phaseRef ?? identity.phaseId }
  const succeededRun = subjectType === 'issue'
    ? (await ledger.listAttempts(subjectId)).slice().reverse().find((run) => run.state === 'succeeded')
    : undefined
  return {
    evidenceReceipts: [{
      schema_version: { major: 1, minor: 0 },
      org_id: orgId,
      correlation_id: `corr-${subjectId}`,
      idempotency_key: `evidence:${subjectId}`,
      receipt_id: `receipt-${subjectId}`,
      producer: 'program-ledger.test',
      subject: { type: subjectType, id: subjectId },
      checksum: { algorithm: 'sha256' as const, value: 'a'.repeat(64) },
      revision_sha: await ledger.getSubjectRevision(subject),
      storage_location: `evidence://${subjectType}/${subjectId}`,
      gate_association: subjectType === 'issue'
        ? (succeededRun ? `gate:${subjectType}:${subjectId}:run:${succeededRun.runId}` : `gate:${subjectType}:${subjectId}`)
        : (succeededRun ? `gate:${subjectType}:${subjectId}:program:${subject.programId}:module:${subject.moduleId ?? ''}:phase:${subject.phaseId ?? ''}:run:${succeededRun.runId}` : `gate:${subjectType}:${subjectId}:program:${subject.programId}:module:${subject.moduleId ?? ''}:phase:${subject.phaseId ?? ''}`),
      timestamp: '2026-08-04T00:00:00.000Z',
    }],
  }
}
