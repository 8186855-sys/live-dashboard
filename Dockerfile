# Stage 1: Build frontend
FROM oven/bun:1-alpine AS frontend-build
WORKDIR /build
COPY packages/frontend/package.json packages/frontend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY packages/frontend/ ./
RUN bun run build

# Stage 2: Run backend + serve static files
FROM oven/bun:1-alpine
WORKDIR /app

# Hugging Face Spaces requires user ID 1000
RUN addgroup -S dashboard -g 1000 && adduser -S dashboard -G dashboard -u 1000 -h /home/dashboard

# Copy backend
COPY packages/backend/package.json packages/backend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY packages/backend/ ./

# Copy frontend build output into backend's public dir
COPY --from=frontend-build /build/out ./public

ENV STATIC_DIR=/app/public
ENV PORT=3000
ENV NODE_ENV=production
ENV HOME=/home/dashboard

USER dashboard
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
