import { throwError } from "#/helpers/throw-error";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CacheControl } from "elysiajs-cdn-cache";
import { cachePlugin } from "#/lib/middlewares/cache-control";
import { getStaticObject } from "#/helpers/volume";

async function getModpacks() {
  const query = await sqlite
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
  .use(cachePlugin())
  .get('/modpacks', async (ctx) => {
    try {
      const modpacks = await getModpacks()

      ctx.cacheControl.set(
        "Cache-Control",
        new CacheControl()
          .set("public", true)
          .set("max-age", 60)
          .set("s-maxage", 60)
      );

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: modpacks })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })