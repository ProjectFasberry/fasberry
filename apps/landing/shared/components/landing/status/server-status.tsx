import { FORUM_SHARED_API } from '@repo/shared/constants/api';
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from '@reatom/async';
import { reatomComponent } from '@reatom/npm-react';

export type Player = {
  uuid: string;
  name_raw: string;
};

type ServerStatus = {
  proxy: {
    online: number,
    players: Array<string>,
    status: string,
    max: number
  },
  servers: {
    bisquite: {
      online: number
    }
  }
}

async function getServerStatus() {
  const res = await FORUM_SHARED_API("get-status", { searchParams: { type: "servers" } })
  const data = await res.json<{ data: ServerStatus } | { error: string }>()
  if (!data || "error" in data) return null;
  return data.data;
}

export const serverStatusResource = reatomResource(async (ctx) => {
  return ctx.schedule(() => getServerStatus())
}).pipe(withCache(), withDataAtom(), withStatusesAtom())

export const ServerStatus = reatomComponent(({ ctx }) => {
  const data = ctx.spy(serverStatusResource.dataAtom)

  return (
    <div className="rounded-xl p-1 block-item">
      <div className="flex flex-col rounded-xl bg-black/80">
        <div className="flex h-[48px] items-center p-3 rounded-t-xl bg-neutral-950/80">
          <p className="text-bisquite-server-color text-2xl">
            Bisquite Survival
          </p>
        </div>
        <div className="flex flex-col rounded-b-xl overflow-y-auto w-[350px] h-[496px] max-h-[496px] bg-black/80">
          <div className="flex flex-row items-center gap-x-1 py-2 px-3">
            <img
              alt=""
              width={26}
              height={26}
              className="w-[26px] h-[26px]"
              src="/images/minecraft/icons/search.webp"
              title="Список игроков"
            />
            <p className="text-green-server-color text-xl text-shadow-xl">
              Сейчас играют:
            </p>
          </div>
          <div className="flex flex-col gap-y-1">
            {ctx.spy(serverStatusResource.statusesAtom).isPending ? (
              <p className="py-2 px-4 text-lg md:text-xl">...</p>
            ) : (
              data?.proxy.players?.map((nickname) => (
                <div key={nickname} className="text-white text-xl cursor-pointer duration-200 hover:bg-neutral-900 py-2 px-4">
                  {nickname}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}, "ServerStatus")