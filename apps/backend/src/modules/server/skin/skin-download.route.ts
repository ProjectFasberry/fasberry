import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getRawSkin } from "./skin.model";

export const skinDownload = new Elysia()
  .get('/download/:nickname', async ({ set, params, status }) => {
    const nickname = params.nickname
    const skin = await getRawSkin(nickname)

    set.headers["content-type"] = 'image/png'
    set.headers['content-disposition'] = `attachment; filename=${nickname}-skin.png`

    return status(HttpStatusEnum.HTTP_200_OK, skin)
  });