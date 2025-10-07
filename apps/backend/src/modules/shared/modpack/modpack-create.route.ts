import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import z from "zod"

async function createModpack({ }: z.infer<typeof modpackCreateSchema>) {
  
}

const modpackCreateSchema = z.object({
  title: z.string()
})

export const modpackCreate = new Elysia()
  .post('/create', async ({ status, body }) => {
    const data = await createModpack(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: modpackCreateSchema
  })