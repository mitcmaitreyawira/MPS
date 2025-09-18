# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@9.9.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build shared package first
FROM base AS shared-builder
WORKDIR /app/packages/shared
RUN pnpm run build

# Build backend
FROM base AS backend-builder
WORKDIR /app
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
RUN pnpm run build:backend

# Build frontend
FROM base AS frontend-builder
WORKDIR /app
COPY --from=shared-builder /app/packages/shared/dist ./packages/shared/dist
RUN pnpm run build:frontend

# Production backend image
FROM node:20-alpine AS backend-production

# Install pnpm
RUN npm install -g pnpm@9.9.0

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=backend-builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=shared-builder --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist

# Copy necessary files
COPY --chown=nestjs:nodejs apps/backend/.env.example ./apps/backend/

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "apps/backend/dist/main.js"]

# Production frontend image (nginx)
FROM nginx:alpine AS frontend-production

# Copy built frontend
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]