# Stage 1: Build all environments
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build -- --configuration=production --output-path=dist/production
RUN npm run build -- --configuration=staging --output-path=dist/staging
RUN npm run build -- --configuration=development --output-path=dist/development

# Stage 2: Runtime image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist /app/dist

# Default to production; override at runtime with -e APP_ENV=staging|development
ENV APP_ENV=production

EXPOSE 4000

CMD ["sh", "-c", "node dist/${APP_ENV}/server/server.mjs"]