import Elysia from "elysia"
import { createEvent, createEventSchema } from "../../server/events/events.model";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { createAdminActivityLog } from "../private.model";

export const eventsCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.EVENTS.CREATE))
  .post("/create", async ({ nickname, body }) => {
    const data = await createEvent(body)

    createAdminActivityLog({ initiator: nickname, event: PERMISSIONS.EVENTS.CREATE })

    return { data }
  }, {
    body: createEventSchema
  })