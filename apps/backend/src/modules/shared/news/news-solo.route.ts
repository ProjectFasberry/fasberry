import Elysia from "elysia";
import z from "zod";
import { getNewsSingle } from "./news.model";

export const newsSingle = new Elysia()
  .get("/:id", async ({ params: { id } }) => {
    const data = await getNewsSingle(id)
    return { data }
  }, {
    params: z.object({ id: z.coerce.number() })
  })