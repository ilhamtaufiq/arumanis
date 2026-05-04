# Stage 1: Build with Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files for dependency install
COPY package.json bun.lock* ./

# Install dependencies
# We need devDependencies for the build step (tsc, vite)
RUN bun install --no-cache --frozen-lockfile || bun install --no-cache

# Copy the rest of the source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build the application
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
