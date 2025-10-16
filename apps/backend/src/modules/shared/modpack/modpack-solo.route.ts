import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";
import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";

async function getModpack(id: number) {
  const query = await general
    .selectFrom("modpacks")
    .select([
      "id",
      "client",
      "created_at",
      "mods",
      "shaders",
      "version",
      "name",
      "imageUrl"
    ])
    .where("id", "=", id)
    .executeTakeFirst()

  return query ?? null;
}

const modpackPayload = t.Object({
  id: t.Number(),
  client: t.String(),
  created_at: t.Date(),
  imageUrl: t.String(),
  mods: t.String(),
  name: t.String(),
  shaders: t.Union([t.String(), t.Null()]),
  version: t.String(),
})

export const modpackSolo = new Elysia()
  .model({
    "modpack": withData(
      t.Nullable(modpackPayload)
    )
  })
  .get("/id", async ({ status, params }) => {
    const id = params.id;
    const data = await getModpack(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    }),
    response: {
      200: "modpack"
    }
  })