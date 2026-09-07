import { createHash } from 'node:crypto'

const SHA1 = /^[a-f0-9]{40}$/i
const SHA256 = /^[a-f0-9]{64}$/i
const FORBIDDEN_KEYS = new Set(['prompt', 'reasoning', 'transcript', 'secret', 'raw_tool'])

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const nonEmpty = (value) => typeof value === 'string' && value.length >= 1 && value.length <= 4096
const semver = (value) => typeof value === 'string' && /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(value)
const relativePath = (value) => typeof value === 'string' && value.length > 0 && value.length <= 1024 && !value.startsWith('/') && !value.includes('\\') && !/(^|\/)\.\.?($|\/)/.test(value) && !/[\u0000-\u001f]/.test(value)
const sha1 = (value) => typeof value === 'string' && SHA1.test(value)
const digest = (value) => typeof value === 'string' && SHA256.test(value)
const enumValue = (value, allowed) => typeof value === 'string' && allowed.includes(value)
const canonical = (value) => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
const canonicalDigest = (value) => createHash('sha256').update(canonical(value)).digest('hex')

function closed(value, path, required, optional, errors) {
  if (!object(value)) { errors.push(`${path} is not an object`); return false }
  const allowed = new Set([...required, ...optional])
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) errors.push(`${path}.${key} is forbidden`)
    else if (!allowed.has(key)) errors.push(`${path}.${key} is not allowed`)
  }
  for (const key of required) if (!(key in value)) errors.push(`${path}.${key} is missing`)
  return true
}

function exact(value, path, required, errors) {
  return closed(value, path, required, [], errors)
}

function dateTime(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value))
}

function uniqueStrings(value, predicate = nonEmpty) {
  return Array.isArray(value) && value.every(predicate) && new Set(value).size === value.length
}

function enumStrings(value, allowed) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && allowed.includes(item)) && new Set(value).size === value.length
}

function releaseSource(value, path, errors) {
  if (!exact(value, path, ['releaseSourceCommitSha', 'releaseSourceRepositoryTreeSha1'], errors)) return
  if (!sha1(value.releaseSourceCommitSha)) errors.push(`${path}.releaseSourceCommitSha is invalid`)
  if (!sha1(value.releaseSourceRepositoryTreeSha1)) errors.push(`${path}.releaseSourceRepositoryTreeSha1 is invalid`)
}

function review(value, path, errors) {
  if (!closed(value, path, ['status'], ['reviewedAt'], errors) || !enumValue(value.status, ['pending', 'passed', 'failed', 'not_required']) || (value.reviewedAt !== undefined && !dateTime(value.reviewedAt))) errors.push(`${path} is invalid`)
}

function controlledMetadata(value, path, projection, errors) {
  const keys = ['domain', 'locales', 'jurisdictions', 'venues', 'platforms', 'channels', 'dataSensitivity', 'commercialUseRights', 'humanReviewRequired', 'sideEffectRiskClass']
  const optional = projection ? keys : [...keys, 'review', 'expiry', 'artifactMedia', 'scopeReference']
  if (!closed(value, path, [], optional, errors)) return
  if (!object(value) || Object.keys(value).length < 1) { errors.push(`${path} must not be empty`); return }
  const enums = {
    domain: ['content', 'design', 'education', 'general', 'marketing', 'operations', 'product', 'research', 'software'],
    dataSensitivity: ['public', 'internal', 'confidential', 'restricted'],
    commercialUseRights: ['allowed', 'conditional', 'not_allowed', 'not_stated'],
    sideEffectRiskClass: ['none', 'low', 'moderate', 'high', 'critical'],
    locales: ['de', 'en', 'en-GB', 'en-US', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'zh', 'zh-CN', 'zh-TW'],
    jurisdictions: ['AU', 'CA', 'CR', 'EU', 'GB', 'global', 'JP', 'SG', 'TW', 'US'],
    venues: ['cli', 'desktop', 'email', 'marketplace', 'mobile', 'physical', 'print', 'server', 'social', 'web'],
    platforms: ['android', 'browser', 'cloud', 'ios', 'linux', 'macos', 'node', 'python', 'windows'],
    channels: ['api', 'cli', 'email', 'internal', 'marketplace', 'mobile_app', 'social', 'website', 'web_app'],
  }
  for (const [key, allowed] of Object.entries(enums)) {
    if (!(key in value)) continue
    const item = value[key]
    if (Array.isArray(item)) {
      if (item.length < 1 || item.length > 8 || !enumStrings(item, allowed)) errors.push(`${path}.${key} is invalid`)
    } else if (!enumValue(item, allowed)) errors.push(`${path}.${key} is invalid`)
  }
  if ('humanReviewRequired' in value && typeof value.humanReviewRequired !== 'boolean') errors.push(`${path}.humanReviewRequired is invalid`)
  if (value.humanReviewRequired === true) review(value.review, `${path}.review`, errors)
  if (value.review !== undefined && value.humanReviewRequired !== true) review(value.review, `${path}.review`, errors)
  if (value.expiry !== undefined && (!exact(value.expiry, `${path}.expiry`, ['expiresAt'], errors) || !dateTime(value.expiry.expiresAt))) errors.push(`${path}.expiry is invalid`)
  if (value.artifactMedia !== undefined && (!exact(value.artifactMedia, `${path}.artifactMedia`, ['type', 'size'], errors) || !enumValue(value.artifactMedia.type, ['application/gzip', 'application/javascript', 'application/json', 'application/octet-stream', 'application/pdf', 'application/zip', 'audio/mpeg', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'text/css', 'text/html', 'text/markdown', 'text/plain', 'video/mp4']) || !Number.isSafeInteger(value.artifactMedia.size) || value.artifactMedia.size < 0 || value.artifactMedia.size > 1099511627776)) errors.push(`${path}.artifactMedia is invalid`)
  if (value.scopeReference !== undefined && (typeof value.scopeReference !== 'string' || !/^scope:[a-z0-9][a-z0-9._-]{2,63}$/.test(value.scopeReference))) errors.push(`${path}.scopeReference is invalid`)
}

function governance(value, path, errors) {
  if (!exact(value, path, ['qualification', 'admission'], errors)) return
  if (!exact(value.qualification, `${path}.qualification`, ['status', 'receiptId', 'independentPass'], errors) || value.qualification.status !== 'qualified' || typeof value.qualification.receiptId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.qualification.receiptId) || value.qualification.independentPass !== true) errors.push(`${path}.qualification is invalid`)
  if (!exact(value.admission, `${path}.admission`, ['status', 'receiptId'], errors) || value.admission.status !== 'admitted' || typeof value.admission.receiptId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.admission.receiptId)) errors.push(`${path}.admission is invalid`)
}

function command(value, path, errors) {
  if (!closed(value, path, ['id', 'executable', 'args', 'shell'], ['cwd', 'timeoutMs'], errors)) return
  if (!object(value) || typeof value.id !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(value.id) || !enumValue(value.executable, ['bash', 'node', 'npm', 'npx', 'pnpm', 'python', 'python3', 'tsx', 'yarn']) || !Array.isArray(value.args) || !value.args.every((arg) => typeof arg === 'string' && arg.length > 0 && !/[\u0000-\u001f`；;|&<>]/.test(arg)) || value.shell !== false || (value.cwd !== undefined && !relativePath(value.cwd)) || (value.timeoutMs !== undefined && (!Number.isInteger(value.timeoutMs) || value.timeoutMs < 1 || value.timeoutMs > 900000))) errors.push(`${path} is invalid`)
}

function substitution(value, path, errors) {
  if (!closed(value, path, ['name', 'source', 'required', 'format'], ['value', 'endpointContractId'], errors)) return
  if (!object(value) || typeof value.name !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(value.name) || !enumValue(value.source, ['input', 'generated', 'constant']) || typeof value.required !== 'boolean' || !enumValue(value.format, ['text', 'relative_path', 'relative_route', 'url']) || (value.source === 'constant') !== ('value' in value) || (value.source !== 'constant' && 'value' in value) || (value.value !== undefined && (typeof value.value !== 'string' || value.value.length < 1 || value.value.length > 4096)) || (value.format === 'url') !== ('endpointContractId' in value) || (value.endpointContractId !== undefined && (typeof value.endpointContractId !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(value.endpointContractId)))) errors.push(`${path} is invalid`)
}

function materialization(value, path, errors) {
  if (!exact(value, path, ['mode', 'sourceRoot', 'destinationRoot', 'commands', 'substitutions', 'outputs', 'network'], errors)) return
  if (!enumValue(value.mode, ['copy', 'template']) || !relativePath(value.sourceRoot) || !relativePath(value.destinationRoot) || !Array.isArray(value.commands) || !Array.isArray(value.substitutions) || !Array.isArray(value.outputs) || !value.outputs.every(relativePath)) errors.push(`${path} is invalid`)
  if (Array.isArray(value.commands)) value.commands.forEach((item, index) => command(item, `${path}.commands[${index}]`, errors))
  if (Array.isArray(value.substitutions)) value.substitutions.forEach((item, index) => substitution(item, `${path}.substitutions[${index}]`, errors))
  if (!exact(value.network, `${path}.network`, ['allowNetwork', 'allowedHosts'], errors) || value.network.allowNetwork !== false || !Array.isArray(value.network.allowedHosts) || value.network.allowedHosts.length !== 0) errors.push(`${path}.network is invalid`)
}

function extension(value, artifactType, path, errors) {
  if (!object(value)) { errors.push(`${path} is not an object`); return }
  if (artifactType === 'component') {
    if (!exact(value, path, ['extensionType', 'entrypoint', 'exports', 'materialization'], errors) || value.extensionType !== 'component' || !relativePath(value.entrypoint) || !Array.isArray(value.exports) || value.exports.length < 1 || !value.exports.every(nonEmpty)) errors.push(`${path} component is invalid`)
    materialization(value.materialization, `${path}.materialization`, errors)
    return
  }
  if (artifactType === 'starter_kit') {
    if (!closed(value, path, ['extensionType', 'surfaces', 'requiredEntrypoints', 'cleanBootstrap', 'noExternalSymlinks', 'environmentVariables', 'substitutions', 'reservedPathCollisions', 'compositionOrder', 'materialization'], ['optionalFeatures'], errors) || value.extensionType !== 'starter_kit' || !Array.isArray(value.surfaces) || value.surfaces.length < 1 || !value.surfaces.every(nonEmpty) || !Array.isArray(value.requiredEntrypoints) || value.requiredEntrypoints.length < 1 || !value.requiredEntrypoints.every(relativePath) || value.noExternalSymlinks !== true || !Array.isArray(value.environmentVariables) || !Array.isArray(value.substitutions) || !Array.isArray(value.reservedPathCollisions) || !value.reservedPathCollisions.every(relativePath) || !nonEmpty(value.compositionOrder)) errors.push(`${path} starter kit is invalid`)
    if (value.optionalFeatures !== undefined && (!Array.isArray(value.optionalFeatures) || !value.optionalFeatures.every(nonEmpty))) errors.push(`${path}.optionalFeatures is invalid`)
    command(value.cleanBootstrap, `${path}.cleanBootstrap`, errors)
    if (Array.isArray(value.environmentVariables)) value.environmentVariables.forEach((item, index) => { if (!exact(item, `${path}.environmentVariables[${index}]`, ['name', 'required', 'description'], errors) || typeof item.name !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(item.name) || typeof item.required !== 'boolean' || !nonEmpty(item.description)) errors.push(`${path}.environmentVariables[${index}] is invalid`) })
    if (Array.isArray(value.substitutions)) value.substitutions.forEach((item, index) => { if (!exact(item, `${path}.substitutions[${index}]`, ['target', 'explicit'], errors) || !relativePath(item.target) || item.explicit !== true) errors.push(`${path}.substitutions[${index}] is invalid`) })
    materialization(value.materialization, `${path}.materialization`, errors)
    return
  }
  if (artifactType === 'website_template') {
    if (!closed(value, path, ['extensionType', 'templateClass', 'contentScope', 'draftOnly', 'directPublication', 'urls', 'compatibilityDisposition', 'routes', 'assets', 'urlPolicy', 'runtimeEndpointContracts', 'materialization'], [], errors) || value.extensionType !== 'website_template' || !enumValue(value.templateClass, ['shared_renderer_declarative', 'full_greenfield_starter_kit', 'dedicated_deployment', 'component_package', 'design_system', 'content_schema', 'foundation_blueprint']) || !Array.isArray(value.urls) || !value.urls.every(nonEmpty) || !enumValue(value.compatibilityDisposition, ['compatible', 'conditionally_compatible', 'incompatible', 'unknown', 'not_applicable']) || !Array.isArray(value.routes) || value.routes.length < 1 || !Array.isArray(value.assets) || !value.assets.every(relativePath) || value.draftOnly !== true || value.directPublication !== false) errors.push(`${path} website template is invalid`)
    if (!exact(value.contentScope, `${path}.contentScope`, ['siteId', 'locale', 'publicationStatus'], errors) || value.contentScope.siteId !== true || value.contentScope.locale !== true || value.contentScope.publicationStatus !== true) errors.push(`${path}.contentScope is invalid`)
    if (Array.isArray(value.routes)) value.routes.forEach((item, index) => { if (!exact(item, `${path}.routes[${index}]`, ['route', 'page'], errors) || typeof item.route !== 'string' || !/^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*)?\/?$/.test(item.route) || !relativePath(item.page)) errors.push(`${path}.routes[${index}] is invalid`) })
    if (!exact(value.urlPolicy, `${path}.urlPolicy`, ['provenanceUrls', 'licenseUrls', 'docsUrls'], errors)) return
    for (const key of ['provenanceUrls', 'licenseUrls', 'docsUrls']) if (!Array.isArray(value.urlPolicy[key]) || value.urlPolicy[key].length < 1 || !value.urlPolicy[key].every((url) => typeof url === 'string' && /^https?:\/\/[^\s]+$/.test(url))) errors.push(`${path}.urlPolicy.${key} is invalid`)
    if (Array.isArray(value.runtimeEndpointContracts)) value.runtimeEndpointContracts.forEach((item, index) => { if (!exact(item, `${path}.runtimeEndpointContracts[${index}]`, ['id', 'category', 'target', 'purpose', 'reviewReference'], errors) || typeof item.id !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(item.id) || !enumValue(item.category, ['asset', 'content', 'customer', 'live', 'analytics', 'webhook', 'payment', 'crm', 'other']) || typeof item.target !== 'string' || !/^https?:\/\/[^\s]+$/.test(item.target) || !nonEmpty(item.purpose) || !nonEmpty(item.reviewReference)) errors.push(`${path}.runtimeEndpointContracts[${index}] is invalid`) })
    materialization(value.materialization, `${path}.materialization`, errors)
    return
  }
  errors.push(`${path}.extensionType is invalid`)
}

function externalReferences(value, errors) {
  if (value === undefined) return
  if (!Array.isArray(value)) { errors.push('manifest.externalReferences is invalid'); return }
  value.forEach((item, index) => { if (!closed(item, `manifest.externalReferences[${index}]`, ['id', 'byteLength', 'sha256', 'mediaType', 'classification', 'retention', 'immutable', 'runtimeDownload'], ['uri', 'locator'], errors) || typeof item.id !== 'string' || !/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(item.id) || !Number.isSafeInteger(item.byteLength) || item.byteLength < 0 || !digest(item.sha256) || typeof item.mediaType !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*$/.test(item.mediaType) || item.mediaType.length > 127 || item.classification !== 'public_reusable' || !enumValue(item.retention, ['release', 'review_only']) || item.immutable !== true || item.runtimeDownload !== false || (typeof item.uri !== 'string' && typeof item.locator !== 'string') || (typeof item.uri === 'string' && typeof item.locator === 'string') || [item.uri, item.locator].filter((value) => value !== undefined).some((value) => typeof value !== 'string' || !/^https?:\/\/[^\s]+$/.test(value))) errors.push(`manifest.externalReferences[${index}] is invalid`) })
}

function validateCatalogue(value, errors) {
  if (!exact(value, 'catalogue', ['schemaVersion', 'schemaRevision', 'catalogueType', 'recordsSha256', 'records'], errors)) return undefined
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || value.catalogueType !== 'catalogue' || !digest(value.recordsSha256) || !Array.isArray(value.records)) errors.push('catalogue is invalid')
  if (Array.isArray(value.records) && digest(value.recordsSha256) && canonicalDigest(value.records) !== value.recordsSha256) errors.push('catalogue.recordsSha256 mismatch')
  return value
}

const recordRequired = ['schemaVersion', 'schemaRevision', 'recordType', 'entryId', 'version', 'artifactType', 'releaseManifestSha256', 'releaseSource', 'artifactTreeSha1', 'inventorySha256', 'lifecycle', 'selectability', 'compatibility', 'bundlePath']
function validateCatalogueRecord(value, path, errors) {
  if (!closed(value, path, recordRequired, ['name', 'summary', 'governance', 'tags', 'controlledMetadata'], errors)) return undefined
  const escapedVersion = typeof value.version === 'string' ? value.version.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&') : ''
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || value.recordType !== 'catalogue_record' || typeof value.entryId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.entryId) || value.entryId.length < 2 || value.entryId.length > 128 || !semver(value.version) || !enumValue(value.artifactType, ['component', 'starter_kit', 'website_template']) || !digest(value.releaseManifestSha256) || !sha1(value.artifactTreeSha1) || !digest(value.inventorySha256) || !enumValue(value.lifecycle, ['draft', 'qualified', 'admitted', 'selectable', 'deprecated', 'withdrawn', 'quarantined', 'rejected', 'superseded']) || !enumValue(value.selectability, ['selectable', 'conditionally_selectable', 'non_selectable']) || !enumValue(value.compatibility, ['compatible', 'conditionally_compatible', 'incompatible', 'unknown', 'not_applicable']) || typeof value.bundlePath !== 'string' || !new RegExp(`^registry/v2/entries/${value.entryId}/versions/${escapedVersion}$`).test(value.bundlePath)) errors.push(`${path} identity or disposition is invalid`)
  if (value.name !== undefined && !nonEmpty(value.name)) errors.push(`${path}.name is invalid`)
  if (value.summary !== undefined && !nonEmpty(value.summary)) errors.push(`${path}.summary is invalid`)
  releaseSource(value.releaseSource, `${path}.releaseSource`, errors)
  if (value.tags !== undefined && !uniqueStrings(value.tags)) errors.push(`${path}.tags is invalid`)
  if (value.selectability === 'selectable') governance(value.governance, `${path}.governance`, errors)
  if (value.controlledMetadata !== undefined) controlledMetadata(value.controlledMetadata, `${path}.controlledMetadata`, true, errors)
  return value
}

function validateManifest(value, errors) {
  if (!closed(value, 'manifest', ['schemaVersion', 'schemaRevision', 'manifestType', 'releaseId', 'entryId', 'artifactType', 'version', 'releaseSource', 'artifactTreeSha1', 'payloadSha256', 'inventorySha256', 'dependencyLockSha256', 'extension'], ['controlledMetadata', 'externalReferences'], errors)) return undefined
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || value.manifestType !== 'immutable_release' || typeof value.releaseId !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(value.releaseId) || value.releaseId.length > 160 || typeof value.entryId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.entryId) || !enumValue(value.artifactType, ['component', 'starter_kit', 'website_template']) || !semver(value.version) || !sha1(value.artifactTreeSha1) || !digest(value.payloadSha256) || !digest(value.inventorySha256) || !digest(value.dependencyLockSha256)) errors.push('manifest identity or digest is invalid')
  releaseSource(value.releaseSource, 'manifest.releaseSource', errors)
  extension(value.extension, value.artifactType, 'manifest.extension', errors)
  if (value.controlledMetadata !== undefined) controlledMetadata(value.controlledMetadata, 'manifest.controlledMetadata', false, errors)
  externalReferences(value.externalReferences, errors)
  return value
}

function validateInventory(value, errors) {
  if (!exact(value, 'inventory', ['schemaVersion', 'schemaRevision', 'inventoryType', 'root', 'complete', 'includesDirectories', 'includesFiles', 'includesSymlinks', 'entries', 'inventorySha256', 'artifactTreeSha1'], errors)) return undefined
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || value.inventoryType !== 'exhaustive_tree_inventory' || !relativePath(value.root) || value.complete !== true || value.includesDirectories !== true || value.includesFiles !== true || value.includesSymlinks !== false || !Array.isArray(value.entries) || !digest(value.inventorySha256) || !sha1(value.artifactTreeSha1)) errors.push('inventory is invalid')
  const paths = new Set()
  if (Array.isArray(value.entries)) value.entries.forEach((entry, index) => {
    if (!object(entry) || !relativePath(entry.path) || paths.has(String(entry.path))) errors.push(`inventory.entries[${index}] path is invalid or duplicated`)
    else paths.add(String(entry.path))
    if (object(entry) && entry.type === 'directory') {
      if (!exact(entry, `inventory.entries[${index}]`, ['path', 'type'], errors)) errors.push(`inventory.entries[${index}] directory is invalid`)
    } else if (object(entry) && entry.type === 'file') {
      if (!closed(entry, `inventory.entries[${index}]`, ['path', 'type', 'byteLength', 'sha256'], ['mediaType', 'classification', 'retention', 'immutable', 'runtimeDownload'], errors) || !Number.isSafeInteger(entry.byteLength) || entry.byteLength < 0 || !digest(entry.sha256)) errors.push(`inventory.entries[${index}] file is invalid`)
      if (entry.mediaType !== undefined && (typeof entry.mediaType !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*$/.test(entry.mediaType) || entry.mediaType.length > 127 || entry.classification !== 'public_reusable' || !enumValue(entry.retention, ['release', 'review_only']) || entry.immutable !== true || entry.runtimeDownload !== false)) errors.push(`inventory.entries[${index}] metadata is invalid`)
    } else errors.push(`inventory.entries[${index}] type is invalid`)
  })
  if (Array.isArray(value.entries) && digest(value.inventorySha256) && canonicalDigest(value.entries) !== value.inventorySha256) errors.push('inventory.inventorySha256 mismatch')
  return value
}

function validateDependencyLock(value, errors) {
  if (!exact(value, 'dependencyLock', ['schemaVersion', 'schemaRevision', 'lockType', 'manager', 'lockVersion', 'dependencies', 'lockSha256'], errors)) return undefined
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || value.lockType !== 'deterministic_dependency_lock' || !enumValue(value.manager, ['npm', 'pnpm', 'yarn', 'pip', 'cargo', 'go', 'other']) || typeof value.lockVersion !== 'string' || value.lockVersion.length < 1 || value.lockVersion.length > 64 || !Array.isArray(value.dependencies) || !digest(value.lockSha256)) errors.push('dependencyLock is invalid')
  const names = new Set()
  if (Array.isArray(value.dependencies)) value.dependencies.forEach((item, index) => {
    if (!closed(item, `dependencyLock.dependencies[${index}]`, ['name', 'version', 'ecosystem', 'source', 'integritySha256', 'dependencies'], ['optional'], errors) || typeof item.name !== 'string' || item.name.length < 1 || item.name.length > 256 || typeof item.version !== 'string' || item.version.length < 1 || item.version.length > 256 || !enumValue(item.ecosystem, ['npm', 'pypi', 'cargo', 'go', 'maven', 'nuget', 'other']) || typeof item.source !== 'string' || !/^(?:https?:\/\/|file:|workspace:|registry:)[^\s]+$/.test(item.source) || !digest(item.integritySha256) || !Array.isArray(item.dependencies) || !item.dependencies.every((dep) => typeof dep === 'string' && dep.length > 0) || (item.optional !== undefined && typeof item.optional !== 'boolean')) errors.push(`dependencyLock.dependencies[${index}] is invalid`)
    if (object(item)) { if (names.has(String(item.name))) errors.push(`dependencyLock.dependencies[${index}] is duplicated`); names.add(String(item.name)) }
  })
  if (Array.isArray(value.dependencies)) {
    for (const [index, item] of value.dependencies.entries()) {
      if (!object(item) || !Array.isArray(item.dependencies)) continue
      for (const dependency of item.dependencies) if (typeof dependency === 'string' && !names.has(dependency)) errors.push(`dependencyLock.dependencies[${index}] closure is invalid`)
    }
    const visiting = new Set()
    const visited = new Set()
    const graph = new Map(value.dependencies.filter(object).map((item) => [String(item.name), Array.isArray(item.dependencies) ? item.dependencies.filter((dependency) => names.has(dependency)) : []]))
    const visit = (name, path) => {
      if (visiting.has(name)) { errors.push(`dependencyLock dependency closure contains a circular runtime dependency: ${[...path, name].join(' -> ')}`); return }
      if (visited.has(name)) return
      visiting.add(name)
      for (const dependency of graph.get(name) ?? []) visit(dependency, [...path, name])
      visiting.delete(name)
      visited.add(name)
    }
    for (const name of graph.keys()) visit(name, [])
  }
  if (Array.isArray(value.dependencies) && digest(value.lockSha256) && canonicalDigest(value.dependencies) !== value.lockSha256) errors.push('dependencyLock.lockSha256 mismatch')
  return value
}

function projectionMatches(recordValue, manifestValue, errors) {
  if (recordValue === undefined) return
  if (!object(recordValue) || !object(manifestValue)) { errors.push('controlledMetadata projection has no manifest source'); return }
  for (const key of Object.keys(recordValue)) if (canonical(recordValue[key]) !== canonical(manifestValue[key])) errors.push(`controlledMetadata.${key} projection mismatch`)
}

function validateReceiptBinding(receipt, catalogue, manifest, inventory, record, catalogueFileSha256, errors) {
  if (!object(receipt)) return
  if (receipt.receiptType === 'verified_cache') {
    if (!digest(receipt.catalogueSha256) || receipt.catalogueSha256 !== catalogueFileSha256) errors.push('verified_cache receipt catalogueSha256 is not bound to the mounted catalogue bytes')
    if (receipt.catalogueRecordsSha256 !== catalogue.recordsSha256 || receipt.releaseManifestSha256 !== record.releaseManifestSha256 || receipt.inventorySha256 !== inventory.inventorySha256 || receipt.payloadSha256 !== manifest.payloadSha256 || receipt.artifactTreeSha1 !== manifest.artifactTreeSha1 || receipt.entryId !== record.entryId || receipt.version !== record.version) errors.push('verified_cache receipt does not match the admitted native release')
  } else if (receipt.receiptType === 'consumption' && (receipt.releaseManifestSha256 !== record.releaseManifestSha256 || receipt.artifactTreeSha1 !== inventory.artifactTreeSha1 || receipt.entryId !== record.entryId || receipt.version !== record.version || receipt.result !== 'pass')) {
    errors.push('consumption receipt does not match the admitted native release')
  }
}

function receiptEntryId(value, path, errors) {
  if (typeof value !== 'string' || value.length < 2 || value.length > 128 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) errors.push(`${path} is invalid`)
}

/** Validate the closed native receipt envelope before any mounted binding. */
export function validateNativeV2ReceiptValue(value) {
  const errors = []
  if (!object(value)) return ['receipt is not an object']
  if (value.receiptType === 'verified_cache') {
    if (!exact(value, 'receipt', ['schemaVersion', 'schemaRevision', 'receiptType', 'sourceEvidence', 'releaseSource', 'catalogueSha256', 'catalogueRecordsSha256', 'entryId', 'version', 'releaseManifestSha256', 'inventorySha256', 'payloadSha256', 'artifactTreeSha1'], errors)) return errors
    if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || !digest(value.catalogueSha256) || !digest(value.catalogueRecordsSha256) || !digest(value.releaseManifestSha256) || !digest(value.inventorySha256) || !digest(value.payloadSha256) || !sha1(value.artifactTreeSha1) || !semver(value.version)) errors.push('verified cache receipt is invalid')
    receiptEntryId(value.entryId, 'receipt.entryId', errors)
    releaseSource(value.releaseSource, 'receipt.releaseSource', errors)
    if (!exact(value.sourceEvidence, 'receipt.sourceEvidence', ['kind', 'receiptId', 'selectedRepositoryCommitSha', 'selectedRepositoryTreeSha1', 'immutable'], errors) || value.sourceEvidence.kind !== 'external_repository_receipt' || !nonEmpty(value.sourceEvidence.receiptId) || !sha1(value.sourceEvidence.selectedRepositoryCommitSha) || !sha1(value.sourceEvidence.selectedRepositoryTreeSha1) || value.sourceEvidence.immutable !== true) errors.push('receipt.sourceEvidence is invalid')
    return errors
  }
  if (value.receiptType !== 'consumption') return ['receipt.receiptType is invalid']
  const required = ['schemaVersion', 'schemaRevision', 'receiptId', 'receiptType', 'entryId', 'version', 'releaseManifestSha256', 'releaseSourceCommitSha', 'releaseSourceRepositoryTreeSha1', 'artifactTreeSha1', 'issuedAt', 'issuer', 'result', 'evidence', 'consumerId', 'consumptionMode']
  if (!closed(value, 'receipt', required, ['qualificationChecks', 'qualificationDisposition', 'compatibilityDisposition', 'decision', 'principalApproval', 'feedbackId', 'consumerMaterializedTreeSha1', 'triage', 'disposition'], errors)) return errors
  if (value.schemaVersion !== 2 || value.schemaRevision !== 2 || typeof value.receiptId !== 'string' || value.receiptId.length < 1 || value.receiptId.length > 160 || !/^[a-z0-9][a-z0-9._-]*$/.test(value.receiptId) || !semver(value.version) || !digest(value.releaseManifestSha256) || !sha1(value.releaseSourceCommitSha) || !sha1(value.releaseSourceRepositoryTreeSha1) || !sha1(value.artifactTreeSha1) || !dateTime(value.issuedAt) || !enumValue(value.result, ['pass', 'fail', 'partial']) || !nonEmpty(value.consumerId) || !enumValue(value.consumptionMode, ['inspect', 'materialize', 'test']) || (value.result === 'pass' && !sha1(value.consumerMaterializedTreeSha1))) errors.push('consumption receipt identity is invalid')
  receiptEntryId(value.entryId, 'receipt.entryId', errors)
  if (!closed(value.issuer, 'receipt.issuer', ['actorType', 'actorId'], [], errors) || !enumValue(value.issuer.actorType, ['human_principal', 'librarian', 'automation']) || !nonEmpty(value.issuer.actorId)) errors.push('receipt.issuer is invalid')
  if (!Array.isArray(value.evidence) || value.evidence.length < 1) errors.push('receipt.evidence is invalid')
  else value.evidence.forEach((item, index) => { if (!exact(item, `receipt.evidence[${index}]`, ['kind', 'locator', 'sha256'], errors) || !enumValue(item.kind, ['file', 'test', 'review', 'receipt', 'command', 'catalogue']) || !nonEmpty(item.locator) || !digest(item.sha256)) errors.push(`receipt.evidence[${index}] is invalid`) })
  return errors
}

/**
 * Canonical native Revision 2 release validation shared by provider selection
 * and deployment admission. It is pure and has no deployment/runtime imports.
 */
export function validateNativeV2Bundle(bundle, options = {}) {
  const errors = []
  if (!closed(bundle, 'bundle', ['source', 'catalogue', 'record', 'manifest', 'inventory', 'dependencyLock', 'receipt'], ['catalogueFileSha256', 'dependencyLockFileSha256'], errors)) return { ok: false, errors }
  const catalogue = validateCatalogue(bundle.catalogue, errors)
  const records = catalogue && Array.isArray(catalogue.records) ? catalogue.records : []
  records.forEach((record, index) => validateCatalogueRecord(record, `catalogue.records[${index}]`, errors))
  const record = validateCatalogueRecord(bundle.record, 'record', errors)
  const manifest = validateManifest(bundle.manifest, errors)
  const inventory = validateInventory(bundle.inventory, errors)
  const dependencyLock = validateDependencyLock(bundle.dependencyLock, errors)
  if (object(bundle.receipt) && ['consumption', 'verified_cache'].includes(bundle.receipt.receiptType)) errors.push(...validateNativeV2ReceiptValue(bundle.receipt))
  if (options.expectedSourceCommitSha !== undefined && bundle.source?.commitSha !== options.expectedSourceCommitSha) errors.push('source.commitSha does not match the expected native provider release')
  if (options.expectedSourceTreeSha !== undefined && bundle.source?.treeSha !== options.expectedSourceTreeSha) errors.push('source.treeSha does not match the expected native provider release tree')
  if (options.expectedCatalogueFileSha256 !== undefined && bundle.catalogueFileSha256 !== options.expectedCatalogueFileSha256) errors.push('catalogue file digest does not match the expected mounted catalogue bytes')
  if (options.expectedCatalogueRecordsSha256 !== undefined && catalogue?.recordsSha256 !== options.expectedCatalogueRecordsSha256) errors.push('catalogue records digest does not match the expected native catalogue')
  if (options.expectedDependencyLockSha256 !== undefined && manifest?.dependencyLockSha256 !== options.expectedDependencyLockSha256) errors.push('manifest dependency lock digest does not match the expected native lock')
  const draftCandidateProbe = options.selectionPolicy === 'draft_candidate_probe'
  if (catalogue && record && !draftCandidateProbe && !records.some((item) => canonical(item) === canonical(record))) errors.push('record is not in the catalogue snapshot')
  if (record && manifest && inventory && dependencyLock) {
    if (draftCandidateProbe) {
      if (record.lifecycle !== 'draft' || record.selectability !== 'non_selectable' || record.compatibility !== 'unknown') errors.push('candidate record is not draft/non_selectable/unknown')
    } else if (!['admitted', 'selectable'].includes(record.lifecycle) || record.selectability !== 'selectable' || record.compatibility !== 'compatible') errors.push('catalogue selected record is not admitted/selectable/compatible')
    if (record.entryId !== manifest.entryId || record.version !== manifest.version || record.artifactType !== manifest.artifactType) errors.push('release identity mismatch')
    if (record.releaseManifestSha256 !== options.releaseManifestSha256 && options.releaseManifestSha256 !== undefined) errors.push('record release manifest digest does not match the mounted manifest')
    if (record.inventorySha256 !== manifest.inventorySha256 || manifest.inventorySha256 !== inventory.inventorySha256 || manifest.artifactTreeSha1 !== inventory.artifactTreeSha1 || record.artifactTreeSha1 !== manifest.artifactTreeSha1) errors.push('release digest or artifact identity mismatch')
    if (options.dependencyLockFileSha256 !== undefined && manifest.dependencyLockSha256 !== options.dependencyLockFileSha256) errors.push('manifest dependency lock digest does not match the mounted dependency lock bytes')
    if (manifest.releaseSource?.releaseSourceCommitSha !== record.releaseSource?.releaseSourceCommitSha || manifest.releaseSource?.releaseSourceRepositoryTreeSha1 !== record.releaseSource?.releaseSourceRepositoryTreeSha1) errors.push('release source identity mismatch')
    projectionMatches(record.controlledMetadata, manifest.controlledMetadata, errors)
    validateReceiptBinding(bundle.receipt, catalogue, manifest, inventory, record, options.catalogueFileSha256 ?? bundle.catalogueFileSha256, errors)
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: { catalogue, record, manifest, inventory, dependencyLock } }
}

export { canonicalDigest }
