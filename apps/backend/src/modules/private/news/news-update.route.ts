import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { validatePermission } from "#/lib/middlewares/validators";
import { createAdminActivityLog } from "../private.model";

const newsUpdateSchema = z.object({
  key: z.enum(["content", "description", "imageUrl", "title"]),
  value: z.string().or(z.object())
})

async function updateNews({ key, value }: z.infer<typeof newsUpdateSchema>) {
  const query = await general
    .updateTable("news")
    .set({ [key]: value })
    .returningAll()
    .executeTakeFirstOrThrow()

  return query;
}

export const newsUpdateRoute = new Elysia()
  .use(validatePermission(PERMISSIONS.NEWS.UPDATE))
  .post("/edit", async ({ nickname, status, body }) => {
    const data = await updateNews(body);

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.NEWS.UPDATE })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: newsUpdateSchema
  })