import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import { general } from "#/shared/database/main-db"
import Elysia from "elysia"

export const optionsList = new Elysia()
  .use(validatePermission(PERMISSIONS.OPTIONS.READ))
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("options")
      .select([
        "name",
        "value",
        "title"
      ])
      .execute()

    return { data }
  })