// This generated baseline is the first migration for an empty production
// database. It creates Payload's own migration ledger and all configured
// collection/global tables before later additive migrations execute.
import * as migration_20251212_000000_payload_initial_baseline from './20251212_000000_payload_initial_baseline'
import * as migration_20251213_locked_docs from './20251213_locked_docs'
import * as migration_20260810_000003_pages_public_activation from './20260810_000003_pages_public_activation'

export const migrations = [
  {
    up: migration_20251212_000000_payload_initial_baseline.up,
    down: migration_20251212_000000_payload_initial_baseline.down,
    name: '20251212_000000_payload_initial_baseline',
  },
  {
    up: migration_20251213_locked_docs.up,
    down: migration_20251213_locked_docs.down,
    name: '20251213_locked_docs',
  },
  {
    up: migration_20260810_000003_pages_public_activation.up,
    down: migration_20260810_000003_pages_public_activation.down,
    name: '20260810_000003_pages_public_activation',
  },
]
