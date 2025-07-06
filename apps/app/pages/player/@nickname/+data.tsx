import { BASE } from "@/shared/api/client";
import { PageContextServer } from "vike/types";
import type { User } from "@repo/shared/types/entities/user"
import { redirect } from "vike/abort";
import { useConfig } from "vike-react/useConfig";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import dayjs from "dayjs"

export type Data = Awaited<ReturnType<typeof data>>;

async function getUser({ headers, nickname }: { nickname: string, headers?: Record<string, string> }) {
  const res = await BASE(`server/user/${nickname}`, { headers, throwHttpErrors: false })
  const data = await res.json<{ data: User } | { error: string }>()

  if (!data || 'error' in data) return null

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  let user: User | null = null;

  try {
    user = await getUser({ headers: pageContext.headers ?? undefined, nickname: pageContext.routeParams.nickname })
  } catch (e) {
    console.error(e)
  }

  if (!user) {
    throw redirect("/not-exist?type=user")
  }

  const description = `Профиль игрока ${user.nickname}. 
  Привилегия: ${DONATE_TITLE[user.group]}. 
  Играет с ${dayjs(user.details.reg_date).format("DD MMM YYYY")}. 
  Последний вход: ${dayjs(user.details.login_date).format("DD MMM YYYY")}`

  const title = wrapTitle(user.nickname)

  config({
    title,
    image: user?.avatar,
    description,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:site" content="@твоя_учетка" />
        <meta name="twitter:creator" content="@твоя_учетка" />
        <link rel="preload" as="image" href={user.avatar} imageSrcSet="" imageSizes="" />
        <meta name="keywords" content={`${user.nickname}, fasberry, fasberry page, профиль ${user.nickname}`} />
      </>
    ),
  })

  return {
    id: pageContext.routeParams.nickname,
    title: pageContext.routeParams.nickname,
    user
  }
}