FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY package.json ./
RUN pnpm install --frozen-lockfile=false

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]

