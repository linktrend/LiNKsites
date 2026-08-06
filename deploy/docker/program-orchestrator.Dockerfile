FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat git ca-certificates && corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS runtime-source
# The orchestrator is a source-runtime workspace application.  Preserve the
# frozen pnpm workspace topology so every @linksites import resolves in the
# container instead of relying on a host checkout.
COPY . .
RUN pnpm install --frozen-lockfile

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 linksites && adduser --system --uid 1001 --ingroup linksites linksites
COPY --from=runtime-source --chown=linksites:linksites /app /app
RUN mkdir -p /var/lib/linksites && chown linksites:linksites /var/lib/linksites
USER linksites
ARG LINKSITES_RELEASE_SHA
RUN test -n "$LINKSITES_RELEASE_SHA" && test "${#LINKSITES_RELEASE_SHA}" = 40
LABEL org.opencontainers.image.title="LiNKsites program orchestrator" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}" \
      org.opencontainers.image.version="${LINKSITES_RELEASE_SHA}"
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/readyz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
# Node's built-in strip-only loader rejects supported project syntax such as
# parameter properties.  `tsx` is installed in the frozen workspace image and
# performs the TypeScript transform before the service starts.
CMD ["node", "/app/deploy/scripts/entrypoint.mjs", "program-orchestrator", "/app/apps/program-orchestrator/node_modules/.bin/tsx", "apps/program-orchestrator/src/service.ts"]
