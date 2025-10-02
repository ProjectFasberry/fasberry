import { throwError } from "#/helpers/throw-error";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticObject } from "#/helpers/volume";
import { main } from "#/shared/database/main-db";

async function getModpacks() {
  const query = await main
    .selectFrom("modpacks")
    .selectAll()
    .execute()

  return query.map(modpack => {
    const mods = JSON.parse(modpack.mods) as string[]
    const shaders = modpack.shaders ? JSON.parse(modpack.shaders) as string[] : []

    return {
      ...modpack, mods, shaders,
      imageUrl: getStaticObject(modpack.imageUrl)
    }
  });
}

export const modpack = new Elysia()
  .get('/modpacks', async (ctx) => {
    try {
      const modpacks = await getModpacks()

      ctx.set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: modpacks })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })