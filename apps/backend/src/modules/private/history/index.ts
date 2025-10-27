import Elysia from "elysia";
import { historyList } from "./history-list.route";

export const history = new Elysia()
  .group("/history", app => app
    .use(historyList)
  )