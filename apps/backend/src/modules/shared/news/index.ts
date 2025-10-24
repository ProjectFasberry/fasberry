import Elysia from "elysia";
import { newsList } from "./news-list.route";
import { newsCreateRoute } from "./news-create.route";
import { defineAdmin } from "#/lib/middlewares/define";
import { newsSolo } from "./news-solo.route";
import { newsDeleteRoute } from "./news-delete.route";
import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import { newsUpdateRoute } from "./news-update.route";

const actions = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .use(defineAdmin())
  .use(newsCreateRoute)
  .use(newsDeleteRoute)
  .use(newsUpdateRoute)

export const news = new Elysia()
  .group("/news", app => app
    .use(newsList)
    .use(newsSolo)
    .use(actions)
  )