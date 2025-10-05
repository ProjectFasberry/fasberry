import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getIsExistsSession } from "./auth.model";
import { defineSession } from "#/lib/middlewares/define";

export const validate = new Elysia()
  .use(defineSession())
  .derive(({ session, status }) => {
    if (!session) {
      return status(HttpStatusEnum.HTTP_200_OK, { data: false })
    }

    return { session }
  })
  .get("/validate-session", async ({ session: token, status }) => {
    const data = await getIsExistsSession(token);

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })