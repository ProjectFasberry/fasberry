import { BASE } from "@/shared/api/client";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";
import dayjs from "@/shared/lib/create-dayjs"
import { Land } from "@repo/shared/types/entities/land";
import { getStaticImage } from "@/shared/lib/volume-helpers";

export type Data = Awaited<ReturnType<typeof data>>;

async function getLand({ ulid, ...args }: { ulid: string } & RequestInit) {
  const res = await BASE(`server/land/${ulid}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<Land>>()

  if (!data || 'error' in data) return null

  return data.data
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  let land: Land | null = null;

  try {
    land = await getLand({ 
      ulid: pageContext.routeParams.id, headers: pageContext.headers ?? undefined
    })
  } catch (e) {
    console.error(e)
  }

  if (!land) {
    throw render("/not-exist?type=land")
  }

  const title = wrapTitle(land.name.slice(0, 64))
  const description = `
  Территория ${land.name}. Создана ${dayjs(land.created_at).format("DD MMM YYYY")}. ${land.members.length} участников`

  config({
    title,
    description,
    image: getStaticImage("arts/adventure-in-blossom.jpg"),
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="keywords" content={`${land.name}, fasberry, fasberry page, территория ${land.name}, land, fasberry land, fasberry ${land.name}`}
        />
      </>
    ),
  })

  return {
    id: pageContext.routeParams.id,
    land
  }
}