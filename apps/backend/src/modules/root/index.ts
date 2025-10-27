import Elysia from "elysia";
import { appGroup } from "./app";
import { validateGroup } from "./validate";

const healthCheck = new Elysia()
  .get("/health", ({ status }) => status(200))

export const root = new Elysia()
  .use(healthCheck)
  .use(appGroup)
  .use(validateGroup)