FROM node:22.17.0-alpine AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json packages/types/package.json
COPY packages/program-ledger/package.json packages/program-ledger/package.json
COPY packages/factory-catalog/package.json packages/factory-catalog/package.json
COPY packages/autowork-boundary/package.json packages/autowork-boundary/package.json
COPY apps/intake-orchestrator/package.json apps/intake-orchestrator/package.json
COPY apps/program-orchestrator/package.json apps/program-orchestrator/package.json
RUN pnpm install --frozen-lockfile

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 linksites && adduser --system --uid 1001 --ingroup linksites linksites
COPY --from=deps /app/node_modules /app/node_modules
COPY --chown=linksites:linksites packages /app/packages
COPY --chown=linksites:linksites apps/intake-orchestrator /app/apps/intake-orchestrator
COPY --chown=linksites:linksites apps/program-orchestrator /app/apps/program-orchestrator
COPY --chown=linksites:linksites deploy /app/deploy
RUN mkdir -p /var/lib/linksites && chown linksites:linksites /var/lib/linksites
USER linksites
LABEL org.opencontainers.image.title="LiNKsites program orchestrator" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.version="${LINKSITES_RELEASE_SHA:-unbound}"
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/readyz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "/app/deploy/scripts/entrypoint.mjs", "program-orchestrator", "node", "--experimental-strip-types", "apps/program-orchestrator/src/service.ts"]
