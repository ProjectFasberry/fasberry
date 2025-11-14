import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Skeleton } from "@repo/ui/skeleton";
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Link } from "@/shared/components/config/link";
import { getStaticObject } from '@/shared/lib/volume';
import { serverStatusAction } from "@/shared/components/landing/status/models/status.model";

export type Player = {
  uuid: string;
  name_raw: string;
};

export type PlayerStatusProps = {
  nickname: string
}

type PlayerStatusImageProps = {
  type?: "small" | "full"
} & PlayerStatusProps

const PlayerStatusImage = ({
  nickname, type = "small"
}: PlayerStatusImageProps) => {
  const { avatarUrl, isLoading } = { avatarUrl: null, isLoading: false }

  if (isLoading) {
    return <Skeleton className={`rounded-md ${type === 'small'
      ? 'max-w-[36px] max-h-[36px]'
      : 'max-w-[164px] max-h-[164px]'}`
    }
    />
  }

  if (!avatarUrl) return null;

  return (
    <img
      height={800}
      width={800}
      className={`rounded-md ${type === 'small'
        ? 'max-w-[36px] max-h-[36px]'
        : 'max-w-[164px] max-h-[164px]'}`
      }
      alt=""
      src={avatarUrl}
    />
  )
}

const PlayerStatus = ({
  nickname
}: PlayerStatusProps) => {
  const nicknameByCookie = null;

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <div
          title="Перейти к игроку"
          className="flex items-center w-full px-4 py-3 rounded-xl duration-300 hover:bg-neutral-700 bg-neutral-800 justify-start gap-4"
        >
          <PlayerStatusImage type="small" nickname={nickname} />
          <Typography color="white" className="text-xl">
            {nickname}
          </Typography>
          {nicknameByCookie && (
            <Typography color="gray" className="text-lg">
              Это вы
            </Typography>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="justify-center !max-w-xl">
        <DialogTitle className="text-center">{nickname}</DialogTitle>
        <div className="flex flex-col items-center gap-8 w-full">
          <PlayerStatusImage type="full" nickname={nickname} />
          <div className="flex flex-col gap-2 w-full">
            <Link
              href={`https://app.fasberry.su/player/${nickname}`}
              className="inline-flex items-center justify-center whitespace-nowrap
							px-4 py-2 hover:bg-[#05b458] duration-300 ease-in-out bg-[#088d47] rounded-md w-full"
            >
              <p className="text-white text-lg">
                Перейти к профилю
              </p>
            </Link>
            <DialogClose className="w-full">
              <div
                className="inline-flex items-center justify-center whitespace-nowrap
								px-4 py-2 hover:bg-[#E66A6D] bg-[#C65558] rounded-md w-full"
              >
                <p className="text-white text-lg">
                  Закрыть
                </p>
              </div>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const PageServerStatus = reatomComponent(({ ctx }) => {
  useUpdate(serverStatusAction, []);

  const data = ctx.spy(serverStatusAction.dataAtom)

  if (ctx.spy(serverStatusAction.statusesAtom).isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 w-full">
        <Skeleton className="w-full h-10" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
      </div>
    )
  }

  const isServerOnline = data?.proxy.status === 'online'

  const playersList = data?.proxy.players
  const playersOnline = data?.proxy.online
  const playersMax = data?.proxy.max

  return (
    <>
      {!isServerOnline && (
        <p className="text-xl px-4 lg:text-2xl">
          Список игроков недоступен
        </p>
      )}
      {(isServerOnline && playersList) && (
        <>
          <p className="text-xl px-4 lg:text-2xl">
            Все игроки: {playersOnline}/{playersMax}
          </p>
          <div className="flex flex-col px-4 gap-2 h-full">
            {playersList.length === 0 && (
              <p className="px-2">
                тишина...
              </p>
            )}
            {playersList.map((nickname) =>
              <PlayerStatus key={nickname} nickname={nickname} />
            )}
          </div>
        </>
      )}
    </>
  )
}, "PageServerStatus")

export default function Page() {
  return (
    <MainWrapperPage variant="with_section">
      <div className="full-screen-section min-h-screen flex items-center justify-center">
        <div className="flex h-full lg:max-h-[500px] flex-col lg:flex-row justify-start overflow-hidden items-start gap-6 responsive">
          <iframe
            src="https://discord.com/widget?id=958086036393689098&theme=dark"
            width="350"
            height="500"
            // @ts-ignore
            allowtransparency={true.toString()}
            className="!rounded-[12px] w-full lg:w-1/4"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
          <div
            className="flex flex-col max-h-[496px] overflow-y-scroll gap-6 rounded-xl py-4 border-2
          border-neutral-600 bg-background-light dark:bg-background-dark w-full lg:w-3/4 h-full"
          >
            <PageServerStatus />
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}
