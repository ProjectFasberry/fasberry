import Elysia from "elysia";
import { eventsDelete } from "./events-delete.route";
import { eventsList } from "./events-list.route";
import { eventsSolo } from "./events-solo.route";
import { eventsCreate } from "./events-create.route";
import { validatePermission } from "#/lib/middlewares/validators";
import { hideOpenApiConfig, openApiPlugin } from "#/lib/plugins/openapi";

const actions = new Elysia(hideOpenApiConfig)
  .use(openApiPlugin())
  .use(validatePermission())
  .use(eventsCreate)
  .use(eventsDelete);
  
export const events = new Elysia()
  .group("/events", app => app
    .use(eventsList)
    .use(eventsSolo)
    .use(actions)
  )