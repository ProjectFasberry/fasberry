import { client } from "@/shared/api/client";
import { PageContextServer } from "vike/types";
import type { User } from "@repo/shared/types/entities/user"
import { redirect } from "vike/abort";
import { useConfig } from "vike-react/useConfig";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import { logRouting } from "@/shared/lib/log";
import { createCtx } from "@reatom/core";
import { getLands, playerLandsAtom } from "@/shared/components/app/player/models/player-lands.model";
import { targetUserAtom } from "@/shared/components/app/player/models/player.model";
import { mergeSnapshot } from "@/shared/lib/snapshot";
import dayjs from "@/shared/lib/create-dayjs"

export type Data = Awaited<ReturnType<typeof data>>;

async function getUser(
  nickname: string,
  init: RequestInit
) {
  const res = await client(`server/player/${nickname}`, { throwHttpErrors: false, ...init })
  const data = await res.json<WrappedResponse<User>>()
  if ('error' in data) throw new Error(data.error)
  return data.data
}

function metadata(
  user: User,
  pageContext: PageContextServer
) {
  const description = `Профиль игрока ${user.nickname}. 
  Привилегия: ${DONATE_TITLE[user.group]}. 
  Играет с ${dayjs(user.details.reg_date).format("DD MMM YYYY")}. 
  Последний вход: ${dayjs(user.details.login_date).format("DD MMM YYYY")}`

  const title = wrapTitle(user.nickname)

  return {
    title,
    image: user?.avatar,
    description,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="preload" as="image" href={user.avatar} imageSrcSet="" imageSizes="" />
        <meta name="keywords" content={`${user.nickname}, fasberry, fasberry page, профиль ${user.nickname}`} />
      </>
    ),
  }
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()
  const headers = pageContext.headers ?? undefined
  const param = pageContext.routeParams.nickname;

  const user = await getUser(param, { headers })

  if (!user) {
    throw redirect("/not-exist?type=user")
  }

  config(metadata(user, pageContext))

  logRouting(pageContext.urlPathname, "data");

  const ctx = createCtx()

  const { data: lands } = await getLands(user.nickname, { headers })

  targetUserAtom(ctx, user);
  playerLandsAtom(ctx, lands);

  pageContext.snapshot = mergeSnapshot(ctx, pageContext)

  return {
    nickname: pageContext.routeParams.nickname,
    user
  }
}