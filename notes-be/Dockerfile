FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy seluruh source code
COPY . .

# Expose port backend
EXPOSE 3003

# Jalankan Node.js server (production)
CMD ["npm", "start"]
