# ==========================================
# Multi-stage Dockerfile for React Vite SPA
# ==========================================

# ── Stage 1: Build Application ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build config
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# ── Stage 2: Serve with Nginx Alpine ──
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA fallback & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
