import Elysia from "elysia";
import z from "zod";
import { getPlayerAvatar, getSkin } from "./skin.model";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const skinSchema = z.object({
  type: z.enum(["full", "head"])
})

export const skinData = new Elysia()
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
