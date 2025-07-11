import { throwError } from '#/helpers/throw-error';
import Elysia, { t } from 'elysia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { getPlayerAvatar, getRawSkin, getSkin } from './skin.model';
import { CacheControl } from 'elysiajs-cdn-cache';
import { cachePlugin } from '#/lib/middlewares/cache-control';

const download = new Elysia()
  .get('/download/:nickname', async (ctx) => {
    const nickname = ctx.params.nickname

    try {
      const skin = await getRawSkin(nickname)

      ctx.headers["content-type"] = 'image/png'
      ctx.headers['content-disposition'] = `attachment; filename=${nickname}-skin.png`

      return ctx.status(HttpStatusEnum.HTTP_200_OK, skin)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  });

const skinSchema = t.Object({
  type: t.UnionEnum(["full", "head"])
})

const skin = new Elysia()
  .use(cachePlugin())
  .get('/:nickname', async (ctx) => {
    const nickname = ctx.params.nickname
    const type = ctx.query.type;

    try {
      let result: string = ""

      switch (type) {
        case "full":
          const skin = await getSkin(nickname)

          result = skin
          break;
        case "head":
          const avatar = await getPlayerAvatar(nickname)

          result = avatar
          break;
        default:
          break;
      }

      if (result) {
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
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: skinSchema });

export const skinGroup = new Elysia()
  .group("/skin", app =>
    app
      .use(skin)
      .use(download)
  )