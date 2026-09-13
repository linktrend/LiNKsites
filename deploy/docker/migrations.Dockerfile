FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed AS inputs
WORKDIR /inputs
COPY supabase/migrations /inputs/supabase
COPY apps/cms/src/migrations /inputs/payload
RUN node --input-type=module <<'NODE'
import { readdir, readFile } from 'node:fs/promises'
const sql = (await readdir('/inputs/supabase')).filter((file) => file.endsWith('.sql')).sort()
if (sql.length === 0) throw new Error('supabase migrations are missing')
const index = await readFile('/inputs/payload/index.ts', 'utf8')
const specifiers = [...index.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map((match) => match[1])
if (specifiers.length === 0) throw new Error('payload migration index has no loaded migrations')
const files = new Set(await readdir('/inputs/payload'))
for (const specifier of specifiers) {
  const source = specifier.replace(/\.js$/, '')
  const candidates = specifier.endsWith('.js')
    ? [`${source}.ts`, specifier]
    : [specifier, `${source}.ts`, `${source}.js`]
  if (!candidates.some((file) => files.has(file))) {
    throw new Error(`payload migration import does not resolve: ${specifier}`)
  }
}
NODE

FROM postgres:16.8-alpine@sha256:3b057e1c2c6dfee60a30950096f3fab33be141dbb0fdd7af3d477083de94166c
ARG LINKSITES_RELEASE_SHA
RUN test -n "$LINKSITES_RELEASE_SHA" && test "${#LINKSITES_RELEASE_SHA}" = 40
RUN addgroup -S -g 1001 linksites && adduser -S -D -u 1001 -G linksites linksites
COPY --from=inputs /inputs/supabase/*.sql /migrations/
COPY --from=inputs /inputs/payload /payload-migrations
COPY deploy/scripts/run-supabase-migrations.sh /usr/local/bin/run-supabase-migrations
RUN chmod 0555 /usr/local/bin/run-supabase-migrations \
 && test -f /payload-migrations/index.ts \
 && test -n "$(ls /migrations/*.sql 2>/dev/null)" \
 && chown -R linksites:linksites /migrations /payload-migrations
USER linksites
LABEL org.opencontainers.image.title="LiNKsites ordered migration job" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}" \
      org.opencontainers.image.version="${LINKSITES_RELEASE_SHA}"
ENTRYPOINT ["/usr/local/bin/run-supabase-migrations"]
