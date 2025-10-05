import Elysia from 'elysia';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { getPlayerAvatar, getRawSkin, getSkin } from './skin.model';
import z from 'zod/v4';

const download = new Elysia()
  .get('/download/:nickname', async ({ set, params, status }) => {
    const nickname = params.nickname
    const skin = await getRawSkin(nickname)

    set.headers["content-type"] = 'image/png'
    set.headers['content-disposition'] = `attachment; filename=${nickname}-skin.png`

    return status(HttpStatusEnum.HTTP_200_OK, skin)
  });

const skinSchema = z.object({
  type: z.enum(["full", "head"])
})

const skin = new Elysia()
  .get('/:nickname', async ({ status, set, ...ctx }) => {
    const nickname = ctx.params.nickname
    const type = ctx.query.type;

    let result: string = ""

    switch (type) {
      case "full":
        const skin = await getSkin(nickname)
        result = skin
        break;
      case "head":
        const avatar = await getPlayerAvatar({ recipient: nickname })
        result = avatar
        break;
      default:
        break;
    }

    if (result) {
      set.headers["Cache-Control"] = "public, max-age=60";

      return status(HttpStatusEnum.HTTP_200_OK, result)
    }

    return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
  }, {
    query: skinSchema
  });

export const skinGroup = new Elysia()
  .group("/skin", app => app
    .use(skin)
    .use(download)
  )