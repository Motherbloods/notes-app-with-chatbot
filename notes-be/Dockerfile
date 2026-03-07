FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev --no-audit --no-fund

# Copy seluruh source code
COPY . .

# Expose port backend
EXPOSE 3003

# Jalankan Node.js server (production)
CMD ["npm", "start"]
