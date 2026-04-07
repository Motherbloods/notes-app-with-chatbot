FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine

WORKDIR /app

# Create non-root user khusus untuk app notes
RUN addgroup -S notes-group && adduser -S notes-user -G notes-group

# Copy dependencies dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=notes-user:notes-group . .

# Use non-root user
USER notes-user

ENV NODE_ENV=production

EXPOSE 3003

# Jalankan Node.js server (production)
CMD ["npm", "start"]
