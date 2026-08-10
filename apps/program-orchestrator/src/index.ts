export * from './contracts.ts'
export * from './graph.ts'
export * from './adapters.ts'
export * from './durable-store.ts'
export * from './runtime.ts'
export * from './executors.ts'
export * from './composition.ts'
export * from './intake.ts'
export * from './lead-research-ingress.ts'
export * from './commercial-outcome-ingress.ts'

if (import.meta.url === `file://${process.argv[1]}`) {
  const { configFromEnvironment, createProductionComposition } = await import('./composition.ts')
  const { runFirstReadyLead } = await import('./intake.ts')
  const config = configFromEnvironment(process.env, process.cwd())
  const composition = await createProductionComposition(config)
  await runFirstReadyLead(composition)
  console.log(JSON.stringify({ status: 'completed', health: await composition.runtime.health() }))
}
