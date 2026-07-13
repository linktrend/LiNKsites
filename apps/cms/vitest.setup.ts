// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Some modules under test (e.g. src/utils/bootstrap.ts) import
// `@/payload.config` at module scope purely for its type/getPayload usage,
// but payload.config.ts throws eagerly at import time if DATABASE_URI is
// unset (a real, intentional runtime safety check). None of the current
// unit/contract tests actually open a database connection -- they mock
// requests and exercise pure access-control logic -- so a placeholder
// value here only satisfies that guard clause and is never used to connect
// to anything. Do NOT put a real connection string here (GAP-43).
process.env.DATABASE_URI ??= 'postgres://vitest:vitest@127.0.0.1:5432/vitest_placeholder_not_a_real_db'
