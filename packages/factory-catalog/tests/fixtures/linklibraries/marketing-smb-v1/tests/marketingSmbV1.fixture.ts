import { marketingSmbV1LibraryAsset } from '../assets/marketingSmbV1.js'

export function marketingSmbV1FixtureTest(): string {
  const rendered = marketingSmbV1LibraryAsset.render({ title: 'Fixture assertion' })
  if (!rendered.includes('data-template="marketing-smb-v1"') || !rendered.includes('<h1>Fixture assertion</h1>')) {
    throw new Error('marketing-smb-v1 entrypoint did not render its expected template output.')
  }
  return rendered
}
