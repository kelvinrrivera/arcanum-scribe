# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S arcanum -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=arcanum:nodejs /app/dist ./dist
COPY --from=builder --chown=arcanum:nodejs /app/server ./server
COPY --from=builder --chown=arcanum:nodejs /app/public ./public

# Create necessary directories
RUN mkdir -p logs uploads && chown -R arcanum:nodejs logs uploads

# Switch to non-root user
USER arcanum

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/health-check.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]