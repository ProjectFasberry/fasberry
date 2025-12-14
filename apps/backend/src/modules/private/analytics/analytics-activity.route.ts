import { general } from "#/shared/database/general-db";
import Elysia from "elysia";

async function getActivity() {
  const query = await general
    .selectFrom("activity_heatmap")
    .selectAll()
    .execute()

  return query
}

export const analyticsActivity = new Elysia()
  .get("/activity", async () => {
    const data = await getActivity()
    return { data }
  })