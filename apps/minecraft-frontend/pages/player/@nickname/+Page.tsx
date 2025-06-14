import { ProfileSkinRender } from "@/components/skin/components/profile-skin-render"
import { requestedUserParamAtom, skinHeadAction } from "@/components/skin/models/skin.model"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/src/components/button"
import { Heart } from "lucide-react"
import { usePageContext } from "vike-react/usePageContext"
import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';
import { ProfileSkinControls } from "@/components/skin/components/profile-skin-controls"

const value = [
  { date: '2016/01/11', count: 2 },
  { date: '2016/01/12', count: 20 },
  { date: '2016/01/13', count: 10 },
  ...[...Array(17)].map((_, idx) => ({
    date: `2016/02/${idx + 10}`, count: idx, content: ''
  })),
  { date: '2016/04/11', count: 2 },
  { date: '2016/05/01', count: 5 },
  { date: '2016/05/02', count: 5 },
  { date: '2016/05/04', count: 11 },
];


const SyncParam = () => {
  const target = usePageContext().routeParams.nickname
  useUpdate((ctx) => requestedUserParamAtom(ctx, target), [])
  return null;
}

const Pre = reatomComponent(({ ctx }) => {
  const head = ctx.spy(skinHeadAction.dataAtom)!

  return (
    <>
      <div className="hidden lg:flex flex-col items-center gap-2 w-1/3 text-zinc-400">
        <ProfileSkinRender />
        <ProfileSkinControls />
      </div>
      <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-zinc-400">
        <img src={head} width={48} height={48} className="w-[128px] h-[128px] cursor-pointer rounded-lg p-0.5 border-2 border-green-600" />
      </div>
    </>
  )
})

export default function PlayerPage() {
  const nickname = usePageContext().routeParams.nickname

  return (
    <div className="flex flex-col lg:flex-row text-neutral-50 w-full h-full items-start gap-8">
      <SyncParam />
      <Pre/>
      <div className="flex flex-col w-full py-4 gap-12 lg:w-2/3 h-full">
        <div className="flex justify-between h-full items-center w-full">
          <div className='flex flex-col gap-2'>
            <h1 className="text-4xl font-bold">{nickname}</h1>
            <span>был на сервере год назад</span>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex px-3 items-center justify-center gap-2 py-1 rounded-full border border-neutral-700">
                <span className="h-[12px] bg-neutral-600 w-[12px] rounded-full" />
                <span>Игрок</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center w-min">
            <Button className="flex border border-neutral-700 rounded-full px-4 items-center gap-2">
              <Heart size={20} className="text-neutral-400" />
              <span className="text-lg">0</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h3 className="font-semibold text-2xl">Статистика</h3>
          <p className="text-lg text-neutral-400">
            Наиграл: <strong>1786.1 ч.</strong> Месяц: <strong>0.0 ч.</strong> Неделя: <strong>0.0 ч.</strong> Сегодня: <strong>0.0 ч.</strong>
          </p>
          <HeatMap
            className="w-full"
            value={value}
            startDate={new Date('2016/01/01')}
            panelColors={{
              0: '#252525',
              7: '#3d3d3d',
              14: '#454545',
              21: '#4f4f4f',
              28: '#5d5d5d',
              35: '#888888'
            }}
            rectProps={{
              rx: 4
            }}
            weekLabels={false}
            monthLabels={false}
            legendCellSize={0}
            rectSize={16}
            rectRender={(props, data) => {
              // if (!data.count) return <rect {...props} />;

              return (
                <Tooltip placement="top" className="text-lg" content={`${data.count || 0}ч`}>
                  <rect {...props} />
                </Tooltip>
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h3 className="font-semibold text-2xl">Привилегия</h3>
          <p className="text-lg text-neutral-400">
            нет
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h3 className="font-semibold text-2xl">Территории</h3>
          <p className="text-lg text-neutral-400">
            нет
          </p>
        </div>
      </div>
    </div >
  )
}