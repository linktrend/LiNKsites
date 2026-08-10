import { drainLiNKautowork } from '../src/payload/utils/autowork.ts'

const intervalMs = Number(process.env.LINKAUTOWORK_WORKER_INTERVAL_MS ?? 5_000)
if (!Number.isInteger(intervalMs) || intervalMs < 100) throw new Error('LINKAUTOWORK_WORKER_INTERVAL_MS must be an integer >= 100')

let stopping = false
let running = false
const drain = async (): Promise<void> => {
  if (running || stopping) return
  running = true
  try {
    await drainLiNKautowork()
  } catch (error) {
    console.error('LiNKautowork durable drain failed', error instanceof Error ? error.message : 'unknown failure')
  } finally {
    running = false
  }
}

const stop = (): void => {
  stopping = true
  clearInterval(timer)
}

process.once('SIGTERM', stop)
process.once('SIGINT', stop)
const timer = setInterval(() => { void drain() }, intervalMs)
void drain()
