import Elysia from "elysia";

export const root = new Elysia()
  .get("/health", ({ status }) => status(200))
