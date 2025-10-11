import dayjs from "@/shared/lib/create-dayjs"
import { wrapTitle } from "@/shared/lib/wrap-title";
import { useConfig } from "vike-react/useConfig";
import { render } from "vike/abort";
import { PageContextServer } from "vike/types";
import { Land } from "@repo/shared/types/entities/land";
import { getStaticImage } from "@/shared/lib/volume-helpers";
import { logRouting } from "@/shared/lib/log";
import { client, withLogging } from "@/shared/lib/client-wrapper";

const previewImage = getStaticImage("arts/adventure-in-blossom.jpg")

export type Data = Awaited<ReturnType<typeof data>>;

async function getLand(ulid: string, init: RequestInit) {
  return client<Land>(`server/land/${ulid}`, init).pipe(withLogging()).exec()
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
    image: previewImage,
    Head: (
      <>
        <meta property="og:url" content={pageContext.urlPathname} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="keywords" content={keywords} />
      </>
    ),
  }
}

export async function data(pageContext: PageContextServer) {
  logRouting(pageContext.urlPathname, "data");

  const config = useConfig()
  const headers = pageContext.headers ?? undefined

  let land: Land | null = null;

  try {
    land = await getLand(pageContext.routeParams.id, { headers })
  } catch {}

  if (!land) {
    throw render("/not-exist?type=land")
  }

  config(metadata(land, pageContext))

  return {
    id: pageContext.routeParams.id,
    data: land
  }
}