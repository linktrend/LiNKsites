# LinkSites Payload CMS — monorepo root build context (Wave 9.1).
# Copies pnpm workspace lockfile + @linksites/types workspace package.

FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat \
 && corepack enable \
 && corepack prepare pnpm@10.0.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json packages/types/package.json
COPY packages/autowork-boundary/package.json packages/autowork-boundary/package.json
COPY apps/cms/package.json apps/cms/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV LINKSITES_BUILD_NO_DATABASE=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm exec turbo run build --filter=@linksites/cms

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/cms/public ./apps/cms/public
RUN mkdir -p apps/cms/.next && chown nextjs:nodejs apps/cms/.next
RUN mkdir -p /var/lib/linksites && chown nextjs:nodejs /var/lib/linksites
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/.next/static ./apps/cms/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/cron ./apps/cms/cron
COPY --from=builder --chown=nextjs:nodejs /app/apps/cms/src/payload/utils ./apps/cms/src/payload/utils
COPY --from=builder --chown=nextjs:nodejs /app/deploy ./deploy
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG LINKSITES_RELEASE_SHA
RUN test -n "$LINKSITES_RELEASE_SHA" && test "${#LINKSITES_RELEASE_SHA}" = 40
LABEL org.opencontainers.image.title="LiNKsites Payload CMS" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}"
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/readyz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "deploy/scripts/entrypoint.mjs", "cms", "node", "apps/cms/server.js"]
