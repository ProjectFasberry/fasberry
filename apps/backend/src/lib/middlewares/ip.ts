import Elysia from "elysia"
import { ip } from "elysia-ip"

export const ipSetup = () => new Elysia()
  .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP"] }))
