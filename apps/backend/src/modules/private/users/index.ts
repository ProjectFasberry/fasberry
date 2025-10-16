import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { usersControl } from "./users-control.route";
import { usersList } from "./users-list.route";

async function getSoloUser(nickname: string) {
  let query = await general
    .selectFrom('players')
    .selectAll()
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  if (!query) return null;

  return query;
}

const usersSolo = new Elysia()
  .get("/:nickname", async ({ status, params }) => {
    const nickname = params.nickname;
    const data = await getSoloUser(nickname);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const users = new Elysia()
  .group("/user", app => app
    .use(usersList)
    .use(usersControl)
    .use(usersSolo)
  )