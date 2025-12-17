# Stage 1: Build with Bun
FROM oven/bun:1-debian AS builder

# Install git (needed for some npm packages)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files (not lockfile - avoid integrity issues)
COPY package.json ./

# Install dependencies fresh
RUN bun install

# Copy source code
COPY . .

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
