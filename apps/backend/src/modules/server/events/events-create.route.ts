import Elysia from "elysia"
import { createEvent, createEventSchema } from "./events.model";
import { validatePermission } from "#/lib/middlewares/validators";

export const eventsCreate = new Elysia()
  .use(validatePermission())
  .post("/create", async ({ body }) => {
    const data = await createEvent(body)
    return { data }
  }, {
    body: createEventSchema
  })