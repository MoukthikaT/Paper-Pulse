# PaperPulse Express Backend Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose default backend port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start Express server
CMD ["node", "server.js"]
