import type { ProgramLedger } from '../src/ledger.js'

export async function canonicalEvidence(ledger: ProgramLedger, subjectType: 'issue' | 'phase' | 'module' | 'program', subjectId: string, orgId: string) {
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
      revision_sha: await ledger.getSubjectRevision(subjectType, subjectId, orgId),
      storage_location: `evidence://${subjectType}/${subjectId}`,
      gate_association: succeededRun ? `gate:${subjectType}:${subjectId}:run:${succeededRun.runId}` : `gate:${subjectType}:${subjectId}`,
      timestamp: '2026-08-04T00:00:00.000Z',
    }],
  }
}
