import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "#/helpers/volume";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";

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

const modpackPayload = t.Object({
  mods: t.Array(t.String()),
  shaders: t.Array(t.String()),
  imageUrl: t.String(),
  client: t.String(),
  created_at: t.Date(),
  id: t.Number(),
  name: t.String(),
  version: t.String(),
})

export const modpackList = new Elysia()
  .model({
    "modpack-list": withData(modpackPayload)
  })
  .get('/list', async ({ status, set }) => {
    const modpacks = await getModpacks()

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"
    set.headers["vary"] = "Origin";
    
    return status(HttpStatusEnum.HTTP_200_OK, { data: modpacks })
  }, {
    response: {
      200: "modpack-list"
    }
  })