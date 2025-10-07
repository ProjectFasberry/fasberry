import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";

async function getModpacks() {
  const query = await general
    .selectFrom("modpacks")
    .selectAll()
    .execute()

  const data = query.map(modpack => {
    const mods = JSON.parse(modpack.mods) as string[]
    const shaders = modpack.shaders ? JSON.parse(modpack.shaders) as string[] : []

    return {
      ...modpack, mods, shaders,
      imageUrl: getStaticUrl(modpack.imageUrl)
    }
  });

  return data
}

export const modpackList = new Elysia()
  .get('/list', async ({ status, set }) => {
    const modpacks = await getModpacks()

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"

    return status(HttpStatusEnum.HTTP_200_OK, { data: modpacks })
  })