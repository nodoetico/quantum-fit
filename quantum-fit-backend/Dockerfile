FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=appuser:appuser /app/prisma ./prisma
USER appuser
EXPOSE 3000
ENV NODE_ENV=production
RUN printf '#!/bin/sh\nset -e\necho "=== Running migrations ==="\nnpx prisma migrate deploy\necho "=== Starting server ==="\nnode dist/index.js 2>&1\n' > /app/start.sh && chmod +x /app/start.sh
CMD ["/app/start.sh"]
