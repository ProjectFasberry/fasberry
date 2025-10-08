import Elysia from "elysia";
import { defineAdmin } from "#/lib/middlewares/define";
import { optionsList } from "./options-list.route";
import { optionsUpdate } from "./options-update.route";

export const options = new Elysia()
  .use(defineAdmin())
  .group("/options", app => app
    .use(optionsList)
    .use(optionsUpdate)
  )