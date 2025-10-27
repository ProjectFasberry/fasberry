import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import Elysia from "elysia";
import { newsCreateRoute } from "./news-create.route";
import { newsDeleteRoute } from "./news-delete.route";
import { newsUpdateRoute } from "./news-update.route";

export const privatedNews = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .group("/news", app => app
    .use(newsCreateRoute)
    .use(newsDeleteRoute)
    .use(newsUpdateRoute)
  )