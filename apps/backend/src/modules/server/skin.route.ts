import SteveHead from "@repo/assets/images/minecraft/steve_head.jpg"
import SteveSkin from "@repo/assets/images/minecraft/steve_skin.png"
import { throwError } from '#/helpers/throw-error';
import fs from 'fs';
import path from 'path';
import Elysia, { t } from 'elysia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { extractHeadFromSkin, getPlayerSkin } from './skin.model';
import { cacheSetup } from '../global/setup';
import { CacheControl } from 'elysiajs-cdn-cache';

const download = new Elysia()
  .get('/download/:nickname', async (ctx) => {
    const { nickname } = ctx.params

    try {
      const skin = await getPlayerSkin(nickname)
      const buffer = await skin.arrayBuffer();

      ctx.headers["content-type"] = 'image/png'
      ctx.headers['content-disposition'] = `attachment; filename=${nickname}-skin.png`

      return ctx.status(HttpStatusEnum.HTTP_200_OK, buffer)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  });

const skinSchema = t.Object({
  type: t.UnionEnum(["full", "head"])
})

const skin = new Elysia()
  .use(cacheSetup)
  .get('/:nickname', async (ctx) => {
    const { nickname } = ctx.params
    const { type } = ctx.query;

    try {
      let result: Blob | null = null;

      const skin = await getPlayerSkin(nickname)

      switch (type) {
        case "full":
          result = skin as Blob;
          break;
        case "head":
          const buffer = await skin.arrayBuffer();
          const head = await extractHeadFromSkin(buffer)
          const blob = new Blob([head], { type: "image/png" })

          result = blob
          break;
        default:
          break;
      }

      if (result) {
        ctx.headers["content-type"] = 'image/png'

        ctx.cacheControl.set(
          "Cache-Control",
          new CacheControl()
            .set("public", true)
            .set("max-age", 60)
            .set("s-maxage", 60)
        );

        return ctx.status(HttpStatusEnum.HTTP_200_OK, result)
      }

      return ctx.status(500)
    } catch (e) {
      const stream = fs.createReadStream(
        path.resolve(type === 'full' ? SteveSkin : SteveHead)
      );

      return ctx.status(HttpStatusEnum.HTTP_200_OK, stream);
    }
  }, { query: skinSchema });

export const skinGroup = new Elysia()
  .group("/skin", app =>
    app
      .use(skin)
      .use(download)
  )