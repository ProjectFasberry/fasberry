import Elysia from "elysia";
import { getRawSkin } from "./skin.model";

export const skinDownload = new Elysia()
  .get('/download/:nickname', async ({ set, params }) => {
    const nickname = params.nickname
    const skin = await getRawSkin(nickname)

    set.headers["content-type"] = 'image/png'
    set.headers['content-disposition'] = `attachment; filename=${nickname}-skin.png`

    return skin
  });