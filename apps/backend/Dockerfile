FROM oven/bun:1 AS build

WORKDIR /

COPY bun.lock* package.json bunfig.toml ./

COPY apps/backend ./apps/backend
COPY packages ./packages

RUN bun install

WORKDIR /apps/backend

RUN bun run build

FROM oven/bun:1-debian AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
  libcairo2 \
  libjpeg62-turbo \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libgif7 \
  libpng16-16 \
  librsvg2-2

WORKDIR /

COPY --from=build /apps/backend/dist ./dist
COPY --from=build /apps/backend/package.json ./package.json

RUN rm -rf node_modules

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
EXPOSE 4104