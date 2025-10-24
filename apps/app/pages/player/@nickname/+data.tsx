import { PageContextServer } from "vike/types";
import type { Player } from "@repo/shared/types/entities/user"
import { redirect } from "vike/abort";
import { useConfig } from "vike-react/useConfig";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import { logRouting } from "@/shared/lib/log";
import { createCtx, Ctx } from "@reatom/core";
import { getLands, playerLandsAtom } from "@/shared/components/app/player/models/player-lands.model";
import { getPlayer, playerAtom } from "@/shared/components/app/player/models/player.model";
import { mergeSnapshot } from "@/shared/lib/snapshot";
import dayjs from "@/shared/lib/create-dayjs"
import { PlayerLandsPayload } from "@repo/shared/types/entities/land";
import { isEmptyArray } from "@/shared/lib/array";

export type Data = Awaited<ReturnType<typeof data>>;

function metadata(
  user: Player,
  pageContext: PageContextServer
) {
  const { nickname } = user

  const description = `Профиль игрока ${nickname}. 
  Привилегия: ${DONATE_TITLE[user.group]}. 
  Играет с ${dayjs(user.meta.reg_date).format("DD MMM YYYY")}. 
  Последний вход: ${dayjs(user.meta.login_date).format("DD MMM YYYY")}`

  const title = wrapTitle(user.nickname)
  const image = user?.avatar
  
  return {
    title,
    image,
    description,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="preload" as="image" href={image} imageSrcSet={`${image} 1x`}  imageSizes="128px" fetchPriority="high" />
        <meta name="keywords" content={`${nickname}, fasberry, fasberry page, профиль ${nickname}`} />
      </>
    ),
  }
}

async function processPlayer(
  ctx: Ctx, player: Player, headers: Record<string, string> | undefined
) {
  playerAtom(ctx, player);

  let lands: PlayerLandsPayload | null = null

  try {
    const data = await getLands(player.nickname, { headers })
    lands = data
  } catch (e) {
    console.error(e)
  }

  playerLandsAtom(ctx, isEmptyArray(lands?.data) ? null : lands);
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  let player: Player | null = null;

  try {
    player = await getPlayer(pageContext.routeParams.nickname, { headers })
  } catch {}

  if (!player) {
    throw redirect("/not-exist?type=player")
  }

  config(metadata(player, pageContext))

  const ctx = createCtx()

  await processPlayer(ctx, player, headers)

  pageContext.snapshot = mergeSnapshot(ctx, pageContext)

  return {
    nickname: pageContext.routeParams.nickname,
    data: player
  }
}