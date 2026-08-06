import { open, readFile } from 'node:fs/promises'
import type { LeadResearchPackage } from '@linksites/types'
import { isLeadResearchPackage } from '../../../packages/types/src/runtime-contracts.ts'
import type { Composition } from './composition.ts'

export class FileLeadIntakeAdapter {
  private readonly claimPath: string
  private readonly inputPath: string

  constructor(inputPath: string, statePath: string) { this.inputPath = inputPath; this.claimPath = `${statePath}.intake.json` }

  async pullReady(): Promise<LeadResearchPackage | null> {
    const raw = await readFile(this.inputPath, 'utf8').catch(() => '')
    const candidate = raw.split(/\r?\n/).map((line) => line.trim()).find(Boolean)
    if (!candidate) return null
    let parsed: unknown
    try { parsed = JSON.parse(candidate) as unknown } catch { return null }
    return isLeadResearchPackage(parsed) ? parsed : null
  }

  async claim(lead: LeadResearchPackage): Promise<boolean> {
    const existing = await readFile(this.claimPath, 'utf8').catch(() => '')
    if (existing) return existing.trim() === lead.idempotency_key
    let handle: Awaited<ReturnType<typeof open>> | undefined
    try {
      handle = await open(this.claimPath, 'wx')
      await handle.writeFile(`${lead.idempotency_key}\n`, 'utf8')
      return true
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
        return (await readFile(this.claimPath, 'utf8').catch(() => '')).trim() === lead.idempotency_key
      }
      throw error
    } finally {
      await handle?.close()
    }
  }
}

export async function runFirstReadyFileLead(composition: Composition): Promise<LeadResearchPackage> {
  const lead = await composition.intake.pullReady()
  if (!lead) throw new Error('W2-02 manual intake is empty or invalid')
  if (!(await composition.intake.claim(lead))) throw new Error('W2-02 manual intake claim was not acquired')
  await composition.runtime.runLead(lead)
  return lead
}
