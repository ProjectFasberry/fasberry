import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import { general } from "#/shared/database/main-db"
import Elysia from "elysia"

async function getOptions() {
  const query = await general
    .selectFrom("options")
    .select([
      "name",
      "value",
      "title"
    ])
    .execute();
    
  return query
}

export const optionsList = new Elysia()
  .use(validatePermission(PERMISSIONS.OPTIONS.READ))
  .get("/list", async () => {
    const data = await getOptions()
    return { data }
  })