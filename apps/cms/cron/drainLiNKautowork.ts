import { drainLiNKautowork } from '@/payload/utils/autowork'

/** Safe to run from a scheduler or container startup; it only drains durable state. */
export const runLiNKautoworkDrain = async (): Promise<void> => {
  await drainLiNKautowork()
}

if (process.argv[1]?.endsWith('drainLiNKautowork.ts')) {
  runLiNKautoworkDrain().catch((error) => {
    console.error('LiNKautowork durable drain failed', error)
    process.exitCode = 1
  })
}
