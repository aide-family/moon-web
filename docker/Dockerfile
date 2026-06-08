# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG APP_NAME
ARG VERSION=dev
ARG BUILD_TIME
ARG REPO

ENV APP_NAME=${APP_NAME}

RUN test -n "${APP_NAME}" && pnpm run "build:${APP_NAME}"

FROM nginx:1.27-alpine

ARG APP_NAME

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/app.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/${APP_NAME} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
