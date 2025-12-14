import Elysia, { t } from "elysia";
import { getEvent } from "./events.model";
import { withData } from "#/shared/schemas";
import { eventPayload } from "./events-list.route";

export const eventsSolo = new Elysia()
  .model({
    "event": withData(
      t.Nullable(eventPayload)
    )
  })
  .get("/:id", async ({ params: { id } }) => {
    const data = await getEvent(id)
    return { data }
  }, {
    response: {
      200: "event"
    }
  })