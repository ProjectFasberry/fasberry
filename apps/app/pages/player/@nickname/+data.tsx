import { client } from "@/shared/api/client";
import { PageContextServer } from "vike/types";
import type { User } from "@repo/shared/types/entities/user"
import { redirect } from "vike/abort";
import { useConfig } from "vike-react/useConfig";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { DONATE_TITLE } from "@repo/shared/constants/donate-aliases";
import dayjs from "@/shared/lib/create-dayjs"
import { logRouting } from "@/pages/store/i/@id/+data";

export type Data = Awaited<ReturnType<typeof data>>;

async function getUser(
  nickname: string, 
  args: RequestInit
) {
  const res = await client(`server/user/${nickname}`, { throwHttpErrors: false, ...args })
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

  let user: User | null = null;

  try {
    user = await getUser(pageContext.routeParams.nickname, { headers })
  } catch (e) {
    console.error(e)
  }

  if (!user) {
    throw redirect("/not-exist?type=user")
  }

  config(metadata(user, pageContext))

  logRouting(pageContext.urlPathname, "data");

  return {
    nickname: pageContext.routeParams.nickname,
    user
  }
}