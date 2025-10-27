import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import { getNats } from "#/shared/nats/client";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";
import { createAdminActivityLog } from "../private.model";

const createBannerSchema = z.object({
  title: z.string(),
  description: z.string().transform((v) => v.trim() || undefined).optional(),
  href: z.object({
    title: z.string(),
    value: z.url()
  })
})

async function createBanner({ title, description, href }: z.infer<typeof createBannerSchema>) {
  const query = await general
    .insertInto("banners")
    .values({
      title,
      description,
      href_title: href.title,
      href_value: href.value
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  const { href_title, href_value, ...base } = query

  return {
    ...base,
    href: {
      title: href_title,
      value: href_value
    }
  };
}

export const bannerCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.BANNERS.CREATE))
  .post("/create", async ({ nickname, status, body }) => {
    const data = await createBanner(body);

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.BANNERS.CREATE })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createBannerSchema
  })