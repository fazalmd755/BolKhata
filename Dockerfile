# Stage 1: Build the React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve static files with lightweight Nginx (Non-root user)
FROM nginx:alpine

# Copy custom Nginx configuration with SPA fallback routing and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure ownership and permissions for non-root execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

# Grant capability to bind port 80 as non-root user
RUN apk add --no-cache libcap && setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
