import { Elysia } from "elysia";
import { serverTiming } from '@elysiajs/server-timing'
import { logger as loggerMiddleware } from "@tqman/nice-logger";
import { swagger } from "@elysiajs/swagger"
import { cors } from '@elysiajs/cors'
import { initNats } from "./shared/nats/nats-client";
import { me } from "#/modules/user/me.route";
import { rateLimitPlugin } from "./lib/middlewares/rate-limit";
import { subscribeRefferalCheck } from "./lib/subscribers/sub-referal-check";
import { subscribePlayerJoin } from "./lib/subscribers/sub-player-join";
import { subscribeReferalReward } from "./lib/subscribers/sub-referal-reward";
import { subscribeGiveBalance } from "./lib/subscribers/sub-give-balance";
import { subscribePlayerStats } from "./lib/subscribers/sub-player-stats";
import { initMinioBuckets, printBuckets } from "./shared/minio/init";
import { bot } from "./shared/bot/logger";
import { handleFatalError } from "./utils/config/handle-log";
import { showRoutes } from "./utils/config/print-routes";
import { ipPlugin } from "./lib/middlewares/ip";
import { validateGroup } from "./modules/private/validation.route";
import { rateGroup } from "./modules/user/like.route";
import { initRedis } from "./shared/redis/init";
import { sessionDerive } from "./lib/middlewares/session";
import { userDerive } from "./lib/middlewares/user";
import { startCacheWorker } from "./utils/workers/currencies";
import { isProduction } from "./helpers/is-production";
import { defineSession } from "./utils/auth/session";
import { INTERNAl_FILES, loadInternalFiles } from "./utils/config/load-internal-files";
import { store } from "./modules/store";
import { auth } from "./modules/auth";
import { server } from "./modules/server";
import { shared } from "./modules/shared";
import { root } from "./modules/root";

function startWorkers() {
  isProduction && startCacheWorker()
}

async function startServices() {
  async function startNats() {
    await initNats()
    subscribeRefferalCheck()
    subscribePlayerJoin()
    subscribeReferalReward()
    subscribeGiveBalance()
    subscribePlayerStats()
  }

  async function startMinio() {
    await printBuckets()
    await initMinioBuckets()
  }

  await startNats()

  await Promise.all([
    startMinio(), 
    initRedis()
  ])

  await loadInternalFiles(INTERNAl_FILES);

  bot.init();
  startWorkers();
}

await startServices()

const app = new Elysia({ prefix: "/minecraft" })
  .use(swagger({
    scalarConfig: {
      spec: {
        url: '/minecraft/swagger/json'
      }
    }
  }))
  .use(rateLimitPlugin())
  .trace(async ({ onHandle, context: { path } }) => {
    onHandle(({ begin, onStop }) => {
      onStop(({ end }) => console.log(`${path} -> ${Math.floor(end - begin)}ms`))
    })
  })
  .use(cors({ credentials: true }))
  .use(serverTiming())
  .use(loggerMiddleware())
  .use(ipPlugin())
  .use(root)
  .use(sessionDerive())
  .onBeforeHandle(async ({ cookie, session, ...ctx }) => {
    defineSession(session, cookie)
  })
  .use(userDerive())
  .use(auth)
  .use(me)
  .use(shared)
  .use(server)
  .use(store)
  .use(validateGroup)
  .use(rateGroup)
  .listen(4104)
  .compile()

showRoutes(app)

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

export type App = typeof app

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);