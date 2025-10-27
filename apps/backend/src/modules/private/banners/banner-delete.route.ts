import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { bannerSchema } from "../../shared/banner/banner.model";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { validatePermission } from "#/lib/middlewares/validators";
import { createAdminActivityLog } from "../private.model";

async function deleteBanner(id: number) {
  const query = await general
    .deleteFrom("banners")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst()

  return query;
}

export const bannerDelete = new Elysia()
  .use(validatePermission(PERMISSIONS.BANNERS.DELETE))
  .delete("/:id", async ({ nickname, status, params }) => {
    const id = params.id;
    const data = await deleteBanner(id);
    
    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.BANNERS.DELETE })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: bannerSchema
  })