import { Elysia, ElysiaConfig } from "elysia";
import { serverTiming as serverTimingPlugin } from '@elysiajs/server-timing'
import { cors } from '@elysiajs/cors'
import { me } from "#/modules/user/me.route";
import { rateLimitPlugin } from "./lib/plugins/rate-limit";
import { initMinioBuckets, printBuckets } from "./shared/minio/init";
import { bot } from "./shared/bot/logger";
import { handleFatalError } from "./utils/config/handle-log";
import { showRoutes } from "./utils/config/print-routes";
import { ipPlugin } from "./lib/plugins/ip";
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
import { startNats } from "./shared/nats/init";
import { loggerPlugin } from "./lib/plugins/logger";
import { swaggerPlugin } from "./lib/plugins/swagger";

const appConfig: ElysiaConfig<string> = {
  prefix: "/minecraft",
  serve: {
    hostname: '0.0.0.0'
  },
  aot: true
}

const corsPlugin = () => new Elysia().use(
  cors({
    credentials: true
  })
)

const app = new Elysia(appConfig)
  .use(swaggerPlugin())
  .use(rateLimitPlugin())
  .use(corsPlugin())
  .use(serverTimingPlugin())
  .use(loggerPlugin())
  .use(ipPlugin())
  .use(root)
  .use(sessionDerive())
  .onBeforeHandle(async ({ cookie, session }) => {
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
  .onError(({ code, error }) => {
    const data = { error: error.toString().slice(0, 128) ?? "Internal Server Error" }
    console.error(error, code)
    return data
  })

async function startServices() {
  function startWorkers() {
    isProduction && startCacheWorker()
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

async function start() {
  await startServices()

  showRoutes(app)

  app.listen(4104);

  console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
}

await start()

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

export type App = typeof app