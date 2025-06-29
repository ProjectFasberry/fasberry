import { Elysia } from "elysia";
import { serverTiming } from '@elysiajs/server-timing'
import { logger } from "@tqman/nice-logger";
import { ip } from "elysia-ip";
import { swagger } from "@elysiajs/swagger"
import { rateLimit } from 'elysia-rate-limit'
import { RateLimitError } from "#/lib/middlewares/rate-limit";
import { cors } from '@elysiajs/cors'
import { initNats } from "./shared/nats-client";

import { login } from "#/modules/auth/login.route";
import { register } from "#/modules/auth/register.route";
import { invalidate } from "#/modules/auth/invalidate.route";
import { validate } from "#/modules/auth/validate.route";
import { me } from "#/modules/user/me.route";

const health = new Elysia().get("/health", ({ status }) => status(200))

export const setup = new Elysia()
  .use(logger())
  .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP"] }))

async function startNats() {
  await initNats()
}

await startNats()

const auth = new Elysia()
  .use(login)
  .use(invalidate)
  .use(register)
  .use(validate)

const app = new Elysia({ prefix: "/minecraft/v2" })
  .use(rateLimit({ errorResponse: new RateLimitError(), max: 300 }))
  .use(serverTiming())
  .use(setup)
  .use(swagger())
  .use(cors({ credentials: true }))
  .use(health)
  .use(auth)
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value ?? null })
  )
  .use(me)
  .listen(4104);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app