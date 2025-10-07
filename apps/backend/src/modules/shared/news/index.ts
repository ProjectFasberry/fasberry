import Elysia from "elysia";
import { newsList } from "./news-list.route";
import { newsCreateRoute } from "./news-create.route";
import { defineAdmin } from "#/lib/middlewares/define";
import { newsSolo } from "./news-solo.route";
import { newsDeleteRoute } from "./news-delete.route";

export const news = new Elysia()
  .group("/news", app => app
    .use(newsList)
    .use(newsSolo)
    .use(defineAdmin())
    .use(newsCreateRoute)
    .use(newsDeleteRoute)
  )