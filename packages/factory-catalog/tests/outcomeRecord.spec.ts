import { describe, expect, it } from 'vitest'
import {
  createOutcomeRecord,
  mapSalesOutcomeToTechnicalDisposition,
  requiresConversionLock,
  requiresRecycling,
} from '../src/outcomeRecord.js'

describe('mapSalesOutcomeToTechnicalDisposition (manual §10.31)', () => {
  it("maps 'engaged' -> 'keep_active'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('engaged')).toBe('keep_active')
  })

  it("maps 'inactive' -> 'extend_hold'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('inactive')).toBe('extend_hold')
  })

  it("maps 'follow_up_scheduled' -> 'keep_active'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('follow_up_scheduled')).toBe('keep_active')
  })

  it("maps 'holding' -> 'extend_hold'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('holding')).toBe('extend_hold')
  })

  it("maps 'rejected' -> 'cleanse_and_recycle'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('rejected')).toBe('cleanse_and_recycle')
  })

  it("maps 'lost_to_competitor' -> 'cleanse_and_recycle'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('lost_to_competitor')).toBe('cleanse_and_recycle')
  })

  it("maps 'not_currently_ready' -> 'extend_hold'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('not_currently_ready')).toBe('extend_hold')
  })

  it("maps 'invalid_lead' -> 'preserve_evidence_and_remove_active_serving'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('invalid_lead')).toBe('preserve_evidence_and_remove_active_serving')
  })

  it("maps 'converted' -> 'lock_for_conversion'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('converted')).toBe('lock_for_conversion')
  })

  it("maps 'expired' -> 'cleanse_and_recycle'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('expired')).toBe('cleanse_and_recycle')
  })

  it("maps 'do_not_contact' -> 'preserve_evidence_and_remove_active_serving'", () => {
    expect(mapSalesOutcomeToTechnicalDisposition('do_not_contact')).toBe('preserve_evidence_and_remove_active_serving')
  })
})

describe('createOutcomeRecord', () => {
  it('derives technicalDisposition from mapSalesOutcomeToTechnicalDisposition() rather than duplicating the table, and populates a real id/timestamp', () => {
    const record = createOutcomeRecord('adaptation-0001', 'converted', 'sales-authority-ref-0001')

    expect(record.technicalDisposition).toBe(mapSalesOutcomeToTechnicalDisposition('converted'))
    expect(record.adaptationId).toBe('adaptation-0001')
    expect(record.salesOutcome).toBe('converted')
    expect(record.salesAuthorityRef).toBe('sales-authority-ref-0001')
    expect(record.outcomeRecordId).toBeTruthy()
    expect(typeof record.outcomeRecordId).toBe('string')
    expect(record.decidedAt).toBeTruthy()
    expect(new Date(record.decidedAt).toString()).not.toBe('Invalid Date')
  })

  it('derives technicalDisposition correctly for a different outcome too (rejected -> cleanse_and_recycle)', () => {
    const record = createOutcomeRecord('adaptation-0002', 'rejected', 'sales-authority-ref-0002')
    expect(record.technicalDisposition).toBe(mapSalesOutcomeToTechnicalDisposition('rejected'))
    expect(record.technicalDisposition).toBe('cleanse_and_recycle')
  })
})

describe('requiresConversionLock', () => {
  it('is true for a converted-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0003', 'converted', 'sales-authority-ref-0003')
    expect(requiresConversionLock(record)).toBe(true)
  })

  it('is false for an engaged-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0004', 'engaged', 'sales-authority-ref-0004')
    expect(requiresConversionLock(record)).toBe(false)
  })

  it('is false for a rejected-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0005', 'rejected', 'sales-authority-ref-0005')
    expect(requiresConversionLock(record)).toBe(false)
  })
})

describe('requiresRecycling', () => {
  it('is true for a rejected-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0006', 'rejected', 'sales-authority-ref-0006')
    expect(requiresRecycling(record)).toBe(true)
  })

  it('is true for an expired-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0007', 'expired', 'sales-authority-ref-0007')
    expect(requiresRecycling(record)).toBe(true)
  })

  it('is true for a lost_to_competitor-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0008', 'lost_to_competitor', 'sales-authority-ref-0008')
    expect(requiresRecycling(record)).toBe(true)
  })

  it('is false for a converted-outcome record', () => {
    const record = createOutcomeRecord('adaptation-0009', 'converted', 'sales-authority-ref-0009')
    expect(requiresRecycling(record)).toBe(false)
  })
})
