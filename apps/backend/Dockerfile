FROM oven/bun:1-debian AS build

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ libvips-dev \
  && rm -rf /var/lib/apt/lists/* \
  && ln -s /usr/bin/python3 /usr/bin/python

COPY package.json bun.lock ./
COPY /apps/backend/package.json ./apps/backend/package.json
COPY /packages/shared/package.json ./packages/shared/package.json
COPY /packages/config-typescript/package.json ./packages/config-typescript/package.json
COPY /packages/config-biome/package.json ./packages/config-biome/package.json

RUN bun install

COPY /apps/backend ./apps/backend
COPY /packages/shared ./packages/shared
COPY /packages/config-typescript ./packages/config-typescript
COPY /packages/config-biome ./packages/config-biome

RUN mkdir -p /app/data/sqlite

RUN bun run --cwd apps/backend build

ENV NODE_ENV=production

WORKDIR /app

CMD ["bun", "run", "apps/backend/dist/index.js"]

EXPOSE 4104