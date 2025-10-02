import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CacheControl } from "elysiajs-cdn-cache";
import { throwError } from "#/helpers/throw-error";
import { main } from "#/shared/database/main-db";

async function getServerIp() {
  const query = await main
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  return query;
}

export const serverip = new Elysia()
  .get("/server-ip", async (ctx) => {
    try {
      const serverIp = await getServerIp()

      ctx.set.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: serverIp })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })