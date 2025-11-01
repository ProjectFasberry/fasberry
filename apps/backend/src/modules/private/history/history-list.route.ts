import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";

export const historyList = new Elysia()
  .use(validatePermission(PERMISSIONS.HISTORY.READ))
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("admin_activity_log")
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();

    return { data }
  })