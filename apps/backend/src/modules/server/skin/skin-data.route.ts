import Elysia, { t } from "elysia";
import { getPlayerAvatar, getSkin } from "./skin.model";

const head = new Elysia()
  .get("/head/:nickname", async ({ set, params }) => {
    const nickname = params.nickname;
    const data = await getPlayerAvatar(set, nickname)

    // set.headers["Cache-Control"] = "public, max-age=60";
    // set.headers["vary"] = "Origin"

    return data
  }, {
    response: {
      200: t.String()
    }
  })

const skinData = new Elysia()
  .get('/skin/:nickname', async ({ set, params }) => {
    const nickname = params.nickname
    const data = await getSkin(set, nickname)

    // set.headers["Cache-Control"] = "public, max-age=60";
    // set.headers["vary"] = "Origin"

    return data
  }, {
    response: {
      200: t.String()
    }
  })

export const skin = new Elysia()
  .group("", app => app
    .use(head)
    .use(skinData)
  )