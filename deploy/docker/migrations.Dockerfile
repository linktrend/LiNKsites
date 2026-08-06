FROM postgres:16.8-alpine@sha256:3b057e1c2c6dfee60a30950096f3fab33be141dbb0fdd7af3d477083de94166c
ARG LINKSITES_RELEASE_SHA
RUN test -n "$LINKSITES_RELEASE_SHA" && test "${#LINKSITES_RELEASE_SHA}" = 40
RUN addgroup -S -g 1001 linksites && adduser -S -D -u 1001 -G linksites linksites
COPY supabase/migrations/*.sql /migrations/
COPY deploy/scripts/run-supabase-migrations.sh /usr/local/bin/run-supabase-migrations
RUN chmod 0555 /usr/local/bin/run-supabase-migrations && chown -R linksites:linksites /migrations
USER linksites
LABEL org.opencontainers.image.title="LiNKsites Supabase migration job" \
      org.opencontainers.image.vendor="LiNKtrend" \
      org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}" \
      org.opencontainers.image.version="${LINKSITES_RELEASE_SHA}"
ENTRYPOINT ["/usr/local/bin/run-supabase-migrations"]
