#!/usr/bin/env bash
set -e

# Production image — Next.js standalone output, minimal size
docker build \
  --no-cache \
  --build-arg RESEND_APIKEY=${RESEND_APIKEY} \
  -t ghcr.io/rmcampos/event.me:latest \
  .

# Migrations image — full node_modules so the Prisma CLI can run `db push`
docker build \
  --no-cache \
  --target migrations \
  -t ghcr.io/rmcampos/event.me:latest-migrations \
  .
