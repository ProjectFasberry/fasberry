import Elysia from "elysia";
import { sessionDerive } from "./session";
import { getUserNickname } from "#/modules/auth/auth.model";

export const userDerive = () => new Elysia()
  .use(sessionDerive())
  .derive({ as: "global" }, async ({ session: token, ...ctx }) => {
    if (!token) {
      return { nickname: null };
    }
    
    const nickname = await getUserNickname(token)

    return { nickname }
  })