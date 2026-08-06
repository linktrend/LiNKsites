import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { GRAPH_EXPORT } from '../src/graph.ts'

const target = process.argv[2] ? resolve(process.argv[2]) : null
const json = `${JSON.stringify(GRAPH_EXPORT, null, 2)}\n`

if (target) {
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, json, 'utf8')
  process.stdout.write(`W2-02 graph export: ${target}\n`)
} else {
  process.stdout.write(json)
}
