FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat && corepack enable && corepack prepare pnpm@10.0.0+sha512.b8fef5494bd3fe4cbd4edabd0745df2ee5be3e4b0b8b08fa643aa3e4c6702ccc0f00d68fa8a8c9858a735a0032485a44990ed2810526c875e416f001b17df12b --activate

FROM base AS runtime-source
# Keep the complete frozen workspace graph in the runtime image.  The worker
# executes TypeScript source through Node's strip-types loader and its
# @linksites/* imports are pnpm workspace symlinks; copying only selected
# package directories leaves those links dangling at runtime.
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
LABEL org.opencontainers.image.title="LiNKsites LiNKautowork durable worker" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}" \
      org.opencontainers.image.version="${LINKSITES_RELEASE_SHA}"
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node /app/deploy/scripts/validate-runtime-config.mjs autowork-worker
CMD ["node", "/app/deploy/scripts/entrypoint.mjs", "autowork-worker", "node", "--experimental-strip-types", "apps/cms/cron/workerLiNKautowork.ts"]
