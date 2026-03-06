# 1. Base Stage (build only)
FROM node:22-slim AS base
ENV DIR=/usr/src/app
WORKDIR $DIR
# Prisma needs openssl and ca-certificates
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Dependencies Stage
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (needed for build) and generate Prisma Client
RUN npm ci && npx prisma generate

# 3. Builder Stage
FROM base AS builder
ARG RESEND_APIKEY
ENV RESEND_APIKEY=${RESEND_APIKEY}
COPY --from=deps $DIR/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Migrations Stage
# Separate image used only by the init-db container to run `prisma db push`.
# Has full node_modules so the Prisma CLI and all its dependencies are available.
FROM base AS migrations
ENV NODE_ENV=production
COPY --from=deps $DIR/node_modules ./node_modules
COPY prisma ./prisma
COPY prisma.config.ts ./
CMD ["node", "node_modules/prisma/build/index.js", "db", "push"]

# 5. Production Stage (The "Runtime") — must be last so it is the default build target
# Uses the standalone output — only traced dependencies are included, not all of node_modules
FROM node:22-slim AS production
ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=900"
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV DIR=/usr/src/app
WORKDIR $DIR

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY healthcheck.js ./

# standalone/ contains server.js + minimal node_modules (traced deps only)
COPY --from=builder --chown=node:node $DIR/.next/standalone ./
# Static assets and public dir must be copied separately
COPY --from=builder --chown=node:node $DIR/.next/static ./.next/static
COPY --from=builder --chown=node:node $DIR/public ./public
# Prisma query engine binary is not always picked up by the tracer — copy explicitly
COPY --from=builder --chown=node:node $DIR/node_modules/.prisma ./node_modules/.prisma

USER node
EXPOSE 3000

CMD ["node", "server.js"]
