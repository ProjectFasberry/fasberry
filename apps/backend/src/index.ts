import "../imports"

import { Elysia, ElysiaConfig } from "elysia";
import { serverTiming as serverTimingPlugin } from '@elysiajs/server-timing'
import { cors } from '@elysiajs/cors'
import { me } from "#/modules/user/me.route";
import { rateLimitPlugin } from "./lib/plugins/rate-limit";
import { initMinio, initMinioBuckets, printBuckets } from "./shared/minio/init";
import { bot } from "./shared/bot/logger";
import { handleFatalError } from "./utils/config/handle-log";
import { showRoutes } from "./utils/config/print-routes";
import { ipPlugin } from "./lib/plugins/ip";
import { privated } from "./modules/private";
import { rate } from "./modules/user/like.route";
import { initRedis } from "./shared/redis/init";
import { startJobs } from "./utils/cron";
import { updateSession } from "./utils/auth/session";
import { INTERNAl_FILES, loadInternalFiles } from "./utils/config/load-internal-files";
import { store } from "./modules/store";
import { auth } from "./modules/auth";
import { server } from "./modules/server";
import { shared } from "./modules/shared";
import { root } from "./modules/root";
import { startNats } from "./shared/nats/init";
import { loggerPlugin } from "./lib/plugins/logger";
import { openApiPlugin } from "./lib/plugins/openapi";
import { isProduction } from "./shared/env";
import { defineSession } from "./lib/middlewares/define";
import { logger } from "./utils/config/logger";
import { checkDatabasesHealth } from "./shared/database/init";

const appConfig: ElysiaConfig<string> = {
  prefix: "/minecraft",
  serve: {
    hostname: '0.0.0.0',
    // idleTimeout: 3
  },
  aot: true
}

const corsPlugin = () => new Elysia().use(
  cors({
    credentials: true
  })
)

const app = new Elysia(appConfig)
  .use(openApiPlugin())
  .use(rateLimitPlugin())
  .use(corsPlugin())
  .use(serverTimingPlugin())
  .use(loggerPlugin())
  .use(ipPlugin())
  .use(root)
  .use(defineSession())
  .onBeforeHandle(async ({ cookie, session: token }) => {
    if (!token) return;
    updateSession(token, cookie)
  })
  .use(auth)
  .use(me)
  .use(shared)
  .use(server)
  .use(store)
  .use(privated)
  .use(rate)
  .onError(({ code, error }) => {
    logger.error(error, code);
    // @ts-expect-error
    const message = error?.message ?? error.response.toString().slice(0, 128) ?? "Internal Server Error";
    const data = { error: message }
    return data
  })
  

async function startServices() {
  await checkDatabasesHealth();
  await startNats();

  async function startMinio() {
    initMinio()
    await printBuckets()
    await initMinioBuckets()
    await loadInternalFiles(INTERNAl_FILES);
  }

  await startMinio();
  await initRedis()

  bot.init();

  if (isProduction) {
    startJobs()
  }
}

async function start() {
  await startServices()

  showRoutes(app)

  app.listen(4104);

  logger
    .withTag("App")
    .log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
}

start()

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

export type App = typeof app