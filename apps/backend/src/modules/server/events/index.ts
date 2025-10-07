import { defineAdmin } from "#/lib/middlewares/define";
import Elysia from "elysia";
import { eventsDelete } from "./events-delete.route";
import { eventsList } from "./events-list.route";
import { eventsSolo } from "./events-solo.route";
import { eventsCreate } from "./events-create.route";

export const events = new Elysia()
  .group("/events", app => app
    .use(eventsList)
    .use(eventsSolo)
    .use(defineAdmin())
    .use(eventsCreate)
    .use(eventsDelete)
  )