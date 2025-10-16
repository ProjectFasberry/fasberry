import { general } from "#/shared/database/main-db";
import Elysia from "elysia";

export const rolesList = new Elysia()
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("roles")
      .select(["id", "name"])
      .orderBy("id", "asc")
      .execute();

    return { data }
  })