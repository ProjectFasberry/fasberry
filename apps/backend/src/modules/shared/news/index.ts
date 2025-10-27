import Elysia from "elysia";
import { newsList } from "./news-list.route";
import { newsSolo } from "./news-solo.route";

export const news = new Elysia()
  .group("/news", app => app
    .use(newsList)
    .use(newsSolo)
  )