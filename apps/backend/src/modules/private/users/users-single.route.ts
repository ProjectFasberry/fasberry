import Elysia from "elysia";
import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";

async function getUser(nickname: string) {
  const query = await general
    .selectFrom('players')
    .selectAll()
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  return query ?? null;
}

export const playersSingle = new Elysia()
  .use(validatePermission(PERMISSIONS.PLAYERS.READ))
  .get("/:nickname", async ({ params }) => {
    const nickname = params.nickname;
    const data = await getUser(nickname);
    return { data }
  })