import { ImmutableRecordError } from '@/hooks/enforceImmutableRecord'
import { LS03_PLAN_BUDGETS } from '@/payload/ls03/semanticContract'

export const applyLsdata01EntitlementDefaults = (data: Record<string, unknown>): void => {
  const planId = data.planId
  const known = planId === 'A' || planId === 'B' || planId === 'C' || planId === 'L'
  if (planId != null && !known) {
    throw new ImmutableRecordError('Unknown capability plan rejected without partial activation.')
  }
  const resolved: 'A' | 'B' | 'C' | 'L' = known ? planId : 'L'
  const granted = LS03_PLAN_BUDGETS[resolved]
  data.planId = resolved
  if (data.grantedCredits == null) {
    data.grantedCredits = granted
  } else if (data.grantedCredits !== granted) {
    throw new ImmutableRecordError('Entitlement credits must match deterministic A/B/C/L defaults; rejected without partial activation.')
  }
  data.budgets = {
    A: LS03_PLAN_BUDGETS.A,
    B: LS03_PLAN_BUDGETS.B,
    C: LS03_PLAN_BUDGETS.C,
    L: LS03_PLAN_BUDGETS.L,
  }
}
