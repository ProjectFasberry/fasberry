import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "#/helpers/volume";
import z from "zod/v4";

const imageSchema = z.object({
  id: z.string().optional(),
  random: z.boolean().optional()
})

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

export const publicImage = new Elysia()
  .get("/public-image", async ({ status, query }) => {
    const { id, random } = query

    let target: string = `0.png`

    if (random) {
      target = `${Math.floor(getRandomArbitrary(1, 20))}.png`
    } else {
      target = `${Number(id)}.png`
    }

    const publicUrl = getStaticUrl(`auth_background/${target}`)

    return status(HttpStatusEnum.HTTP_200_OK, { data: publicUrl })
  }, {
    query: imageSchema
  })