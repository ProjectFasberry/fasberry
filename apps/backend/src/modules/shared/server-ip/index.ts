import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";

async function getServerIp() {
  const query = await general
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  return query ?? null;
}

export const serverip = new Elysia()
  .get("/server-ip", async ({ status, set }) => {
    const data = await getServerIp()

    set.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"
    set.headers["vary"] = "Origin";
    
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    response: {
      200: withData(
        t.Nullable(t.String())
      )
    }
  })