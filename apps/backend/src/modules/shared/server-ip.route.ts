import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { CacheControl } from "elysiajs-cdn-cache";
import { throwError } from "#/helpers/throw-error";
import { cachePlugin } from "#/lib/middlewares/cache-control";

async function getServerIp() {
  const query = await sqlite
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  return query;
}

export const serverip = new Elysia()
  .use(cachePlugin())
  .get("/server-ip", async (ctx) => {
    try {
      const serverIp = await getServerIp()

      ctx.cacheControl.set(
        "Cache-Control",
        new CacheControl()
          .set("public", true)
          .set("max-age", 600)
          .set("s-maxage", 600)
      );

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: serverIp })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })