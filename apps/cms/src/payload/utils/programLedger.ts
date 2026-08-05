import { Client } from 'pg'
import type { PayloadRequest } from 'payload'
import type { ProgramPass, ProgramPassReader } from './autowork'

/** Reads the authoritative accepted Program Gate from the durable Program Ledger. */
export const readProgramPassFromLedger: ProgramPassReader = async ({ programId, orgId, leadId, siteId }: { req: PayloadRequest; programId: string; orgId: string; leadId: string; siteId: string }): Promise<ProgramPass | null> => {
  const connectionString = process.env.DATABASE_URI
  if (!connectionString) throw new Error('DATABASE_URI is required for the durable Program Ledger PASS reader')
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const result = await client.query<{ gate_id: unknown; decision: unknown; org_id: unknown; subject_id: unknown; subject_program_id: unknown }>(
      'select gate_id, decision, org_id, subject_id, subject_program_id from lsites_ledger.gate_results where subject_type = $1 and subject_id = $2 and org_id = $3 and subject_program_id = $4 and subject_module_id is null and subject_phase_id is null order by decided_at desc nulls last, gate_id desc limit 1',
      ['program', programId, orgId, programId],
    )
    const gate = result.rows[0]
    if (!gate || gate.decision !== 'accepted' || gate.org_id !== orgId || gate.subject_id !== programId || gate.subject_program_id !== programId || typeof gate.gate_id !== 'string') return null
    return { state: 'PASS', completionId: gate.gate_id, programId, orgId, leadId, siteId }
  } finally {
    await client.end()
  }
}
