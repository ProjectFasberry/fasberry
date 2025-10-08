import Elysia from "elysia"
import { HttpStatusEnum } from "elysia-http-status-code/status"
import { createEvent, createEventSchema } from "./events.model";
import { validatePermission } from "#/lib/middlewares/validators";

export const eventsCreate = new Elysia()
  .use(validatePermission())
  .post("/create", async ({ status, body }) => {
    const data = await createEvent(body)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: createEventSchema
  })