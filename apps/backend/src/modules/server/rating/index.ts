import Elysia from "elysia";
import z from "zod";
import { events, ratingSchema } from "./rating.model";

const bySchema = z.enum(["belkoin", "charism", "lands_chunks", "reputation", "playtime", "parkour"])

export const ratingList = new Elysia()
  .get("/rating/:by", async ({  params, query }) => {
    const by = params.by;
    const event = events[by];

    try {
      const data = await event(query);

      // set.headers["Cache-Control"] = "public, max-age=30"
      // set.headers["vary"] = "Origin";

      return { data }
    } catch (e) {
      console.error(e)
      return { data: { data: [], meta: { } }}
    } 
  }, {
    params: z.object({
      by: bySchema,
    }),
    query: ratingSchema
  })