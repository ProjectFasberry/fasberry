import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import { general } from "#/shared/database/main-db"
import Elysia from "elysia"

export const dictionariesList = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.READ))
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("dictionaries")
      .selectAll()
      .execute()

    return { data }
  })