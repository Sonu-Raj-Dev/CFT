# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 5000

CMD ["node", "dist/index.js"]
