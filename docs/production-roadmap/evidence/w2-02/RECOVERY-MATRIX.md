# W2-02 recovery matrix

| Failure point | Durable response | Downstream effect |
| --- | --- | --- |
| Lead invalid | Reject before Program creation | No Issue graph or completion |
| Transient external boundary | Run is recorded, Issue is retry-scheduled, bounded by `maxAttempts` | Same idempotency key reuses local effect |
| Crash after irreversible adapter receipt | Adapter effect and ledger receipt survive; replay returns the prior effect | No duplicate draft/preview/event |
| Gate rejection | Gate evidence is absent/rejected and Issue becomes failed | Preview and completion remain unreachable |
| Permanent failure after an irreversible boundary | Issue becomes manual attention and a compensation record is written | Human resolution required; no false completion |
| Retry budget exhausted | Run enters dead letter and Program fails | No completion is emitted |
| Duplicate lead | Existing Program is resumed by lead/idempotency identity | One graph and one logical completion |
| Duplicate completion delivery | Durable completion reservation plus sink idempotency key | One NDJSON completion record |

The implementation does not claim automatic rollback of a real Payload or
hosted deployment. Local compensation is an explicit, persisted manual-attention
boundary and must be replaced with environment-specific rollback policy before
live operation.
