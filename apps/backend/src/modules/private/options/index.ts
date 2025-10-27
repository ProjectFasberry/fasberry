import Elysia from "elysia";
import { optionsList } from "./options-list.route";
import { optionsUpdate } from "./options-update.route";

export const options = new Elysia()
  .group("/options", app => app
    .use(optionsList)
    .use(optionsUpdate)
  )