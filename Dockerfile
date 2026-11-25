# Multi-stage Production Dockerfile for Kazakhstan Travel Platform
FROM node:24-slim AS builder
WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY apps/bots/package.json apps/bots/
COPY apps/web/package.json apps/web/

RUN npm install --no-audit --no-fund

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm --workspace=@kt/core run build \
  && npm --workspace=@kt/bots run build \
  && npm --workspace=@kt/web run build

FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=384

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/apps/bots ./apps/bots
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/tsconfig.json
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next

RUN mkdir -p /app/data /app/apps/web/public/uploads

EXPOSE 3000
CMD ["sh", "-c", "cd /app/apps/web && exec ../../node_modules/.bin/next start -H 0.0.0.0 -p \"${PORT:-3000}\""]
