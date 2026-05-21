# Stage 1: Build with Bun
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files for dependency install
COPY package.json bun.lock* ./

# Install dependencies with cache optimization
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Set environment to production
ARG VITE_API_BASE_URL=http://localhost:8000/api
ARG VITE_OPENROUTER_API_KEY=
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_OPENROUTER_API_KEY=$VITE_OPENROUTER_API_KEY

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
