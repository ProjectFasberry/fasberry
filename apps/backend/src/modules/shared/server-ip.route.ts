import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";

async function getServerIp() {
  const query = await general
    .selectFrom("ip_list")
    .select("ip")
    .where("name", "=", "server_proxy")
    .executeTakeFirst()

  return query;
}

export const serverip = new Elysia()
  .get("/server-ip", async ({ status, set }) => {
    const serverIp = await getServerIp()

    set.headers["Cache-Control"] = "public, max-age=600, s-maxage=600"

    return status(HttpStatusEnum.HTTP_200_OK, { data: serverIp })
  })