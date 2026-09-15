# The Server03/CMS release image is built from the monorepo root with
# deploy/docker/cms.Dockerfile. This in-app file is not a publication source.
FROM node:22.17.0-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed
ARG LINKSITES_RELEASE_SHA
RUN test -n "$LINKSITES_RELEASE_SHA" && test "${#LINKSITES_RELEASE_SHA}" = 40 \
 && echo 'use deploy/docker/cms.Dockerfile for LiNKsites release images' >&2 \
 && exit 1
LABEL org.opencontainers.image.revision="${LINKSITES_RELEASE_SHA}"
