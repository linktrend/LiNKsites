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
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-master/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-master/.next/static ./apps/web-master/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web-master/server.js"]
