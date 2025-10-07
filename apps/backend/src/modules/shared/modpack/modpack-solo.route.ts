import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
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

export const modpackSolo = new Elysia()
  .get("/id", async ({ status, params }) => {
    const id = params.id;
    const data = await getModpack(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })