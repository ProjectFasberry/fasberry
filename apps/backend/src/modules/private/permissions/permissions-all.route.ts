import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";

async function getPermissions() {
  const query = await general
    .selectFrom("permissions")
    .selectAll()
    .execute()

  return query
}

export const permissionsListAll = new Elysia()
  .use(validatePermission(PERMISSIONS.PERMISSIONS.READ))
  .get("/list/all", async () => {
    const data = await getPermissions();
    return { data }
  })