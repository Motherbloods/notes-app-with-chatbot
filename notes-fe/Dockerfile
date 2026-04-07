FROM node:20-alpine AS builder

WORKDIR /app

# Create non-root user khusus frontend notes
RUN addgroup -S notes-fe-group && adduser -S notes-fe-user -G notes-fe-group

# Copy package files
COPY --chown=notes-fe-user:notes-fe-group package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY --chown=notes-fe-user:notes-fe-group . .

# Build args
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
# Build untuk production
RUN npm run build

# Stage 2: Serve dengan Nginx
FROM nginx:alpine

# Copy hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} \; \
    && find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
    && mkdir -p /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi \
    && chown -R nginx:nginx /tmp/client_body /tmp/proxy /tmp/fastcgi /tmp/uwsgi /tmp/scgi

# Expose port 5174
EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
