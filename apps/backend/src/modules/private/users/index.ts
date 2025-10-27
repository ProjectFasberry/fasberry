import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { playersControl } from "./users-control.route";
import { playersList } from "./users-list.route";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";

async function getSoloUser(nickname: string) {
  let query = await general
    .selectFrom('players')
    .selectAll()
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  if (!query) return null;

  return query;
}

const playersSingle = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.READ))
  .get("/:nickname", async ({ status, params }) => {
    const nickname = params.nickname;
    const data = await getSoloUser(nickname);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const users = new Elysia()
  .group("/user", app => app
    .use(playersList)
    .use(playersControl)
    .use(playersSingle)
  )