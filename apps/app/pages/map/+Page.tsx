import { Link } from "@/shared/components/config/link"
import { getStaticImage } from "@/shared/lib/volume-helpers"
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async"
import { atom } from "@reatom/core"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { IconExternalLink } from "@tabler/icons-react"

const mapImage = getStaticImage("arts/6.jpg")

const MapPreviewImage = () => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        src={mapImage}
        draggable={false}
        alt=""
        width={800}
        height={800}
        className="absolute w-full h-[210px] rounded-lg object-cover"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}

const getServerMapUrl = (value: string) => `https://map.${value}.fasberry.su`

const mock = [
  { name: "Bisquite", value: "bisquite", href: getServerMapUrl("bisquite"), img: "" },
  { name: "Muffin", value: "muffin", href: getServerMapUrl("muffin"), img: "" },
]

const serversAvailableAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(() =>
    mock
  )
}).pipe(withDataAtom(null), withCache({ swr: false }), withStatusesAtom())

const ServersList = reatomComponent(({ ctx }) => {
  useUpdate(serversAvailableAction, []);

  if (ctx.spy(serversAvailableAction.statusesAtom).isPending) {
    return (
      <div className="flex w-full gap-2 items-center *:rounded-lg *:h-46 *:w-full">
        <Skeleton />
        <Skeleton />
      </div>
    )
  }

  const data = ctx.spy(serversAvailableAction.dataAtom);
  if (!data) return null;

  return (
    <div className="flex w-full gap-2 items-center">
      {data.map((server) => (
        <div
          key={server.value}
          className="flex flex-col gap-4 w-full border border-neutral-800 rounded-lg p-4"
        >
          <Typography className='font-semibold text-base'>
            {server.name}
          </Typography>
          <Link href={server.href} target="_blank">
            <Button background="white" className="gap-2 py-1">
              <Typography className='font-semibold leading-6'>
                Перейти
              </Typography>
              <IconExternalLink size={16} />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}, 'ServersList')

export default function Page() {
  return (
    <div className="flex flex-col w-full gap-6">
      <MapPreviewImage />
      <div className="flex flex-col gap-4 h-full w-full">
        <Typography className="text-3xl font-semibold">
          Выбери сервер
        </Typography>
        <ServersList />
      </div>
    </div>
  )
}