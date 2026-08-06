# LinkSites shared frontend (web-master) — monorepo root build context (Wave 9.2).

FROM node:22.17.0-alpine AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat \
 && corepack enable \
 && corepack prepare pnpm@10.0.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json packages/types/package.json
COPY packages/autowork-boundary/package.json packages/autowork-boundary/package.json
COPY apps/web-master/package.json apps/web-master/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_PAYLOAD_API_URL
ARG PAYLOAD_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_PAYLOAD_API_URL=${NEXT_PUBLIC_PAYLOAD_API_URL}
ENV PAYLOAD_PUBLIC_SERVER_URL=${PAYLOAD_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_CMS_PROVIDER=payload
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm exec turbo run build --filter=@linksites/web-master

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web-master/public ./apps/web-master/public
RUN mkdir -p apps/web-master/.next && chown nextjs:nodejs apps/web-master/.next
RUN mkdir -p /var/lib/linksites && chown nextjs:nodejs /var/lib/linksites
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-master/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-master/.next/static ./apps/web-master/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/deploy ./deploy
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ARG LINKSITES_RELEASE_SHA
LABEL org.opencontainers.image.title="LiNKsites web-master" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}"
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/readyz').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "deploy/scripts/entrypoint.mjs", "web-master", "node", "apps/web-master/server.js"]
