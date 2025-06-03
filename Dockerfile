# Use official alpine Node.js LTS image
FROM node:22-alpine AS builder

# Set working directory
RUN mkdir -p /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy the rest of the app
COPY . .

# Copy tsconfig.json
COPY tsconfig.json ./

# Build the app
RUN npm run build

# Prune the app
RUN npm prune --production

# Use a smaller image for the app
FROM node:22-alpine AS app

WORKDIR /app

# Copy the dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy the built app
COPY --from=builder /app/dist ./dist

# Expose the port your app runs on
EXPOSE 4000

# Start the app
CMD ["node", "dist/index.js"]