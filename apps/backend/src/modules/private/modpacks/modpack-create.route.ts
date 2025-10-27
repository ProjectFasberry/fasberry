import { validatePermission } from "#/lib/middlewares/validators"
import { PERMISSIONS } from "#/shared/constants/permissions"
import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import z from "zod"
import { createAdminActivityLog } from "../private.model"

async function createModpack({ }: z.infer<typeof modpackCreateSchema>) {
  
}

const modpackCreateSchema = z.object({
  title: z.string()
})

export const modpackCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.MODPACKS.CREATE))
  .post('/create', async ({ nickname, status, body }) => {
    const data = await createModpack(body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.MODPACKS.CREATE })

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: modpackCreateSchema
  })