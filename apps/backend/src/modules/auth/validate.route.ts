import Elysia, { t } from "elysia";
import { getIsExistsSession } from "./auth.model";
import { defineSession } from "#/lib/middlewares/define";
import { withData } from "#/shared/schemas";

export const validate = new Elysia()
  .use(defineSession())
  .derive(({ session }) => {
    if (!session) return { data: false }
  
    return { session }
  })
  .get("/validate-session", async ({ session }) => {
    const data = await getIsExistsSession(session);
    return { data }
  }, {
    response: {
      200: withData(t.Boolean())
    }
  })