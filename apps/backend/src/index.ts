import { Elysia } from "elysia";
import { serverTiming } from '@elysiajs/server-timing'
import { logger as loggerMiddleware } from "@tqman/nice-logger";
import { swagger } from "@elysiajs/swagger"
import { cors } from '@elysiajs/cors'
import { initNats } from "./shared/nats/nats-client";
import { login } from "#/modules/auth/login.route";
import { register } from "#/modules/auth/register.route";
import { invalidate } from "#/modules/auth/invalidate.route";
import { validate } from "#/modules/auth/validate.route";
import { me } from "#/modules/user/me.route";
import { news, soloNews } from "./modules/shared/news.route";
import { rateLimitPlugin } from "./lib/middlewares/rate-limit";
import { modpack } from "./modules/shared/modpack.route";
import { rules } from "./modules/shared/rules.route";
import { serverip } from "./modules/shared/server-ip.route";
import { store } from "./modules/shared/donates.route";
import { publicImage } from "./modules/shared/image.route";
import { userLocation } from "./modules/server/location.route";
import { favoriteItem } from "./modules/server/favorite-item.route";
import { minecraftItems } from "./modules/server/minecraft-items.route";
import { skinGroup } from "./modules/server/skin.route";
import { playerBalance, playerSkills, playerStats } from "./modules/server/player.route";
import { ratingBy } from "./modules/server/rating.route";
import { land, lands, playerLands } from "./modules/server/lands.route";
import { processPlayerVote } from "./modules/server/process-vote.route";
import { achievements, achievementsMeta } from "./modules/server/achievements.route";
import { userGameStatus } from "./modules/server/game-status.route";
import { subscribeRefferalCheck } from "./lib/subscribers/sub-referal-check";
import { subscribePlayerJoin } from "./lib/subscribers/sub-player-join";
import { subscribeReferalReward } from "./lib/subscribers/sub-referal-reward";
import { subscribeReceiveFiatPayment } from "./lib/subscribers/sub-receive-fiat-payment";
import { subscribeGiveBalance } from "./lib/subscribers/sub-give-balance";
import { subscribePlayerStats } from "./lib/subscribers/sub-player-stats";
import { initMinioBuckets, showMinio } from "./shared/minio/init";
import { status } from "./modules/server/status.route";
import { user } from "./modules/user/user.route";
import { bot } from "./shared/bot/logger";
import { handleFatalError } from "./utils/config/handle-log";
import { showRoutes } from "./utils/config/print-routes";
import { ipPlugin } from "./lib/middlewares/ip";
import { logger } from "./utils/config/logger";
import { validateGroup } from "./modules/private/validation.route";
import { rateGroup } from "./modules/user/like.route";
import { initRedis } from "./shared/redis/init";
import { sessionDerive } from "./lib/middlewares/session";
import { userDerive } from "./lib/middlewares/user";
import { refreshSession } from "./modules/auth/auth.model";
import { isProduction } from "./helpers/is-production";
import { getOrderRoute } from "./modules/payment/get-order.route";
import { checkOrderRoute } from "./modules/payment/check-order.route";
import { currencies } from "./modules/payment/currencies.route";
import { createOrderRoute } from "./modules/payment/create-order.route";
import { DOMAIN } from "./helpers/cookie";
import { restore } from "./modules/auth/restore.route";

async function startNats() {
  await initNats()

  // subscribePlayerGroup()
  subscribeRefferalCheck()
  subscribePlayerJoin()
  subscribeReferalReward()
  subscribeReceiveFiatPayment()
  subscribeGiveBalance()
  subscribePlayerStats()
}

await startNats()
await showMinio()
await initMinioBuckets()
await initRedis()

const health = new Elysia()
  .get("/health", ({ status }) => status(200))

const auth = new Elysia()
  .group("/auth", app =>
    app
      .use(login)
      .use(invalidate)
      .use(register)
      .use(validate)
      .use(restore)
  )

const payment = new Elysia()
  .group("/payment", app => app
    .use(getOrderRoute)
    .use(checkOrderRoute)
    .use(createOrderRoute)
    .use(currencies)
  )

const shared = new Elysia()
  .group("/shared", app => app
    .use(news)
    .use(soloNews)
    .use(modpack)
    .use(rules)
    .use(serverip)
    .use(store)
    .use(publicImage)
  )

const hooks = new Elysia()
  .group("/hooks", app =>
    app
      .use(processPlayerVote)
  )

const server = new Elysia()
  .group("/server", app =>
    app
      .use(favoriteItem)
      .use(userLocation)
      .use(minecraftItems)
      .use(skinGroup)
      .use(playerStats)
      .use(playerSkills)
      .use(playerBalance)
      .use(ratingBy)
      .use(land)
      .use(lands)
      .use(playerLands)
      .use(achievementsMeta)
      .use(achievements)
      .use(userGameStatus)
      .use(status)
      .use(user)
  )

export const SESSION_KEY = "session"

const app = new Elysia({ prefix: "/minecraft" })
  .use(swagger())
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
  .use(health)
  .use(sessionDerive())
  .onBeforeHandle(async ({ cookie, session: token, ...ctx }) => {
    if (!token) return;

    const refreshResult = await refreshSession(token);

    if (refreshResult) {
      cookie.session.httpOnly = true
      cookie.session.sameSite = "lax"
      cookie.session.domain = DOMAIN
      cookie.session.secure = isProduction
      cookie.session.expires = refreshResult.expires_at
      cookie.session.path = "/"
      cookie.session.value = token
    } 
    // else {
    //   const sessionExistsInRedis = (await redis.exists(`session:${sessionToken}`)) === 1;

    //   if (!sessionExistsInRedis) {
    //     // Если cookie есть, а сессии в редисе нет - чистим cookie
    //     cookie.session.remove();
    //   }
    // }
  })
  .use(userDerive())
  .use(auth)
  .use(me)
  .use(shared)
  .use(server)
  .use(payment)
  .use(validateGroup)
  .use(rateGroup)
  .use(hooks)
  .listen(4104)
  .compile()

bot.init();

showRoutes(app)

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

export type App = typeof app

logger.success(`Server is running at ${app.server?.hostname}:${app.server?.port}`);