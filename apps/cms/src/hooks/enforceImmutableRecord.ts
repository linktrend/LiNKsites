import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook } from 'payload'

export class ImmutableRecordError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImmutableRecordError'
  }
}

export const rejectImmutableUpdate: CollectionBeforeChangeHook = ({ operation }) => {
  if (operation === 'update') {
    throw new ImmutableRecordError(
      'LS-03 immutable record mutation rejected; create a replacement, rollback, or successor record instead.',
    )
  }
}

export const rejectImmutableDelete: CollectionBeforeDeleteHook = () => {
  throw new ImmutableRecordError(
    'LS-03 immutable record deletion rejected; archive via a successor record instead.',
  )
}
