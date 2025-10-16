import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";
import { wrapError } from "#/helpers/wrap-error";
import { withData, withError } from "#/shared/schemas";
import { getServerStatus } from "./status.model";

const statusSchema = z.object({
  type: z.enum(["servers", "services"])
})

export const status = new Elysia()
  .model({
    "status": withData(
      t.Object({
        proxy: t.Object({
          status: t.String(),
          online: t.Number(),
          max: t.Number(),
          players: t.Array(t.String()),
        }),
        servers: t.Object({
          bisquite: t.Object({
            online: t.Number(),
            max: t.Number(),
            players: t.Array(t.String()),
            status: t.String(),
          })
        })
      })
    )
  })
  .get("/status", async ({ status, set, query }) => {
    const type = query.type;

    if (type === 'services') {
      return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, wrapError("Not supported"))
    }

    const data = await getServerStatus()

    set.headers["Cache-Control"] = "public, max-age=60, s-maxage=60"
    set.headers["vary"] = "Origin";

    return { data }
  }, {
    query: statusSchema,
    response: {
      200: "status",
      500: withError
    }
  })