import Elysia, { t } from "elysia";
import { withData, withError } from "#/shared/schemas";
import { getServerStatus } from "./status.model";

export const status = new Elysia()
  .model({
    "status": withData(
      t.Nullable(
        t.Object({
          proxy: t.Object({
            status: t.String(),
            online: t.Number(),
            max: t.Number(),
            players: t.Array(t.String()),
          }),
          servers: t.Record(
            t.String(),
            t.Object({
              online: t.Number(),
              max: t.Number(),
              players: t.Array(t.String()),
              status: t.String(),
            })
          )
        })
      )
    )
  })
  .get("/status", async () => {
    const data = await getServerStatus()
    return { data }
  }, {
    response: {
      200: "status",
      500: withError
    }
  })