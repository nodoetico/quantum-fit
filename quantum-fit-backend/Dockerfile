FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && \
    addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser && \
    printf '#!/bin/sh\necho "=== Running migrations ==="\nnpx prisma migrate deploy 2>&1\nMIGRATE_EXIT=$?\necho "=== Migration exit code: $MIGRATE_EXIT ==="\necho "=== Starting server ==="\nnode dist/index.js 2>&1\nRET=$?\necho "=== Server exited with code $RET ===" >&2\nexit $RET\n' > /app/start.sh && \
    chmod +x /app/start.sh
COPY --from=builder /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=appuser:appuser /app/prisma ./prisma
USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["/app/start.sh"]
