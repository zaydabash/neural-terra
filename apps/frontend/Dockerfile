FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY apps/frontend/package*.json ./
RUN npm ci

# Copy application code
COPY apps/frontend/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
