import Elysia from "elysia";
import { general } from "#/shared/database/general-db";
import { getChartData, registrationsSchema } from "./analytics.model";

export const analyticsRegistrations = new Elysia()
  .get("/registrations", async ({ query }) => {
    const base = await general
      .selectFrom("AUTH")
      .select([
        "NICKNAME as id",
        "REGDATE as created_at"
      ])
      .execute()

    const results = base.map((target) => ({
      id: target.id,
      created_at: Number(target.created_at!)
    }))

    const data = getChartData(results, query);

    return { data }
  }, {
    query: registrationsSchema
  })