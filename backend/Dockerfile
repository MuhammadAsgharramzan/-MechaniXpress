FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and prisma schema first (for better Docker layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm install

# Copy rest of source
COPY . .

# Build TypeScript
RUN npm run build

# Generate Prisma Client (must run AFTER schema is present)
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start the compiled server
CMD ["npm", "start"]
