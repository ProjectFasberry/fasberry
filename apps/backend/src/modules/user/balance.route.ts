import Elysia, { t } from "elysia";
import { defineUser } from "#/lib/middlewares/define";
import { withData } from "#/shared/schemas";
import { getBalance } from "./balance.model";

const balancePayload = t.Object({
  CHARISM: t.Number(),
  BELKOIN: t.Number()
})

export const balance = new Elysia()
  .use(defineUser())
  .model({
    "balance": withData(balancePayload)
  })
  .get("/balance", async ({ nickname }) => {
    const data = await getBalance(nickname)
    return { data }
  }, {
    response: {
      200: "balance"
    }
  })