FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci || npm install

# Build the frontend application
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy built artifacts into the appropriate subdirectory
# so Nginx root can correctly serve them via /admin/... routing
COPY --from=builder /app/build /usr/share/nginx/html/admin

# Specify configuration to serve React Router inside /admin
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    location /admin { \
        try_files $uri $uri/ /admin/index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
