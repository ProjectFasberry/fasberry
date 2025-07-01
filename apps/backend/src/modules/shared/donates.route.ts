import { throwError } from "#/helpers/throw-error";
import Elysia, { Static, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getStaticUrl } from "./news.route";
import { payments } from "#/shared/database/payments-db";

async function getDonatesByType(args: Static<typeof donatesSchema>) {
  switch (args.type) {
    case "donate":
      const donateQuery = await payments
        .selectFrom("donate")
        .selectAll()
        .orderBy("id", "asc")
        .execute()

      return donateQuery.map((donate) => {
        const imageUrl = donate.imageUrl
        const url = getStaticUrl(imageUrl)

        return { ...donate, imageUrl: url }
      })
    case "wallet":
      const walletQuery = await payments
        .selectFrom("economy")
        .select(eb => [
          "type",
          eb.cast<number>("value", "integer").as("value")
        ])
        // order when charism is first
        .orderBy("type", "asc")
        .execute()

      return walletQuery
    case "events":
      // const eventsQuery = await paymentsDB
      //   .selectFrom("events")
      //   .selectAll()
      //   .execute()

      const events = [
        {
          type: "player",
          title: "Телепорт на спавн",
          description: "Телепортировать выбранного игрока на спавн",
          wallet: "charism",
          price: 10
        }
      ]

      return events
    default:
      throw new Error("Invalid type")
  }
}

const donatesSchema = t.Object({
  type: t.UnionEnum(["donate", "wallet", "events"])
})

export const store = new Elysia()
  .group("/store", (app) =>
    app
      .get("/items", async (ctx) => {
        const result = ctx.query;

        try {
          const donates = await getDonatesByType(result);

          return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: donates })
        } catch (e) {
          return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
        }
      }, {
        query: donatesSchema
      })
  )