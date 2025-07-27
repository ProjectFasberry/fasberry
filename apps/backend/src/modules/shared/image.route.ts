import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { getStaticObject } from "#/helpers/volume";

const imageSchema = t.Object({
  id: t.Optional(
    t.String()
  ),
  random: t.Optional(
    t.Boolean()
  )
})

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

export const publicImage = new Elysia()
  .get("/public-image", async (ctx) => {
    const { id, random } = ctx.query

    try {
      let target: string = `0.png`

      if (random) {
        target = `${Math.floor(getRandomArbitrary(1, 20))}.png`
      } else {
        target = `${Number(id)}.png`
      }

      const publicUrl = getStaticObject(`auth_background/${target}`)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: publicUrl })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: imageSchema })