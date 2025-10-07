import { client } from "@/shared/api/client";
import { wrapTitle } from "@/shared/lib/wrap-title";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";
import dayjs from "@/shared/lib/create-dayjs"
import { Land } from "@repo/shared/types/entities/land";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { logRouting } from "@/shared/lib/log";

export type Data = Awaited<ReturnType<typeof data>>;

async function getLand(
  ulid: string, 
  args: RequestInit
) {
  const res = await client(`server/land/${ulid}`, { throwHttpErrors: false, ...args })
  const data = await res.json<WrappedResponse<Land>>()
  if ('error' in data) throw new Error(data.error)
  return data.data
}

function metadata(
  land: Land,
  pageContext: PageContextServer
) {
  const title = wrapTitle(land.name.slice(0, 64))
  const created_at = dayjs(land.created_at).format("DD MMM YYYY");
  const description = `Территория ${land.name}. Создана ${created_at}. ${land.members.length} участников`
  const keywords = `${land.name}, fasberry, fasberry page, территория ${land.name}, land, fasberry land, fasberry ${land.name}`

  return {
    title,
    description,
    image: getStaticImage("arts/adventure-in-blossom.jpg"),
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="keywords" content={keywords}
        />
      </>
    ),
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  const land = await getLand(pageContext.routeParams.id, { headers })

  if (!land) {
    throw render("/not-exist?type=land")
  }

  config(metadata(land, pageContext))
  
  return {
    id: pageContext.routeParams.id,
    data: land
  }
}