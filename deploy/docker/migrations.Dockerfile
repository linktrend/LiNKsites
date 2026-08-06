FROM postgres:16.8-alpine
RUN addgroup -S -g 1001 linksites && adduser -S -D -u 1001 -G linksites linksites
COPY supabase/migrations/*.sql /migrations/
COPY deploy/scripts/run-supabase-migrations.sh /usr/local/bin/run-supabase-migrations
RUN chmod 0555 /usr/local/bin/run-supabase-migrations && chown -R linksites:linksites /migrations
USER linksites
LABEL org.opencontainers.image.title="LiNKsites Supabase migration job" \
      org.opencontainers.image.vendor="LiNKtrend"
ENTRYPOINT ["/usr/local/bin/run-supabase-migrations"]
