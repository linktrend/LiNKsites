FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Alpine v3.22 main versions equal on x86_64 and aarch64. Live APKINDEX remains mutable.
RUN apk add --no-cache libc6-compat=1.1.0-r4 git=2.49.1-r0 ca-certificates=20260611-r0 \
 && git config --system --add safe.directory /opt/linksites/linklibraries \
 && corepack enable \
 && corepack prepare pnpm@10.0.0+sha512.b8fef5494bd3fe4cbd4edabd0745df2ee5be3e4b0b8b08fa643aa3e4c6702ccc0f00d68fa8a8c9858a735a0032485a44990ed2810526c875e416f001b17df12b --activate

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
