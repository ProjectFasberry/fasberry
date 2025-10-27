import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";
import Elysia from "elysia";
import { eventsCreate } from "./events-create.route";
import { eventsDelete } from "./events-delete.route";

export const privatedEvents = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .group("/events", app => app
    .use(eventsCreate)
    .use(eventsDelete)
  )