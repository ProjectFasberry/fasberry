import { ShopNickname } from "./shop-list-wallets"
import { Typography } from "@/shared/ui/typography"
import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@/shared/ui/skeleton"
import { Donates, donatesResource, storeItem } from "./store.model"

const DonateListNotFound = () => {
  return (
    <Typography color="gray" className="text-2xl">
      Не удалось получить доступные привилегии. Повторите позже
    </Typography>
  )
}

const DonatesListSkeleton = () => {
  return (
    <>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </>
  )
}

export const DonatesList = reatomComponent(({ ctx }) => {
  const data = ctx.spy(donatesResource.dataAtom)
  const shopItemState = ctx.spy(storeItem)

  if (ctx.spy(donatesResource.statusesAtom).isPending) return <DonatesListSkeleton/>

  if (!data) return <DonateListNotFound />

  const donates = data as Donates[]
  const selected = shopItemState?.paymentValue

  const changeDonate = (type: "authentic" | "loyal" | "arkhont") => {
    if (type === selected) return;

    const donate = donates.find(w => w.origin === type)
    if (!donate) return;

    storeItem(ctx, (state) => ({
      ...state,
      paymentType: "donate",
      paymentValue: type,
      category: state.category,
    }))
  }

  return (
    <>
      {(donates as Donates[]).map(d => (
        <div
          key={d.origin}
          className={`flex items-center w-full min-h-16 gap-4 rounded-lg px-4 py-3 border-2 
            bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer
          ${d.origin === selected ? 'border-green' : 'border-transparent'}
        `}
          onClick={() => changeDonate(d.origin as "authentic" | "loyal" | "arkhont")}
        >
          <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
            <img src={d.imageUrl} width={36} height={36} alt="" />
          </div>
          <Typography className="text-[20px]" color="white">
            {d.title}
          </Typography>
        </div>
      ))}
    </>
  )
}, "DonatesList")

export const SelectedDonate = reatomComponent(({ctx}) => {
  const shopItemState = ctx.spy(storeItem)
  const currentDonates = ctx.spy(donatesResource.dataAtom) as Donates[]

  const selectedDonate = currentDonates
    ? currentDonates.find(cw => cw.origin === shopItemState.paymentValue) : null;

  return (
    selectedDonate ? (
      <>
        <div className="flex flex-col w-full items-center justify-center border-2 border-neutral-600/40 rounded-xl p-4">
          <Typography className="text-lg md:text-xl lg:text-2xl">
            {selectedDonate.title}
          </Typography>
          <Typography color="gray" className="text-center text-sm md:text-base lg:text-lg">
            {selectedDonate.description}
          </Typography>
        </div>
        <div className="flex flex-col w-full gap-4 items-center overflow-auto max-h-[260px] justify-start border-2 border-neutral-600/40 rounded-xl p-4">
          <div className="flex flex-col w-full">
            <Typography className="text-[20px]">
              ⭐ Возможности на сервере:
            </Typography>
            <div className="flex flex-col w-full">
              {selectedDonate.commands.map((sd, i) => (
                <Typography key={i} className="text-[16px]">
                  ⏹ {sd}
                </Typography>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full">
            <Typography className="text-[20px]">
              ⭐ Возможности на форуме{selectedDonate.origin !== 'authentic' && <span className="text-neutral-400">: *от аутентика</span>}:
            </Typography>
            {selectedDonate.origin === 'authentic' && (
              <div className="flex flex-col w-full">
                {selectedDonate.forum!.map((sd, i) => (
                  <Typography key={i} className="text-[16px]">
                    ⏹ {sd}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
          <ShopNickname />
        </div>
      </>
    ) : (
      <Typography className="text-2xl">
        Донат не выбран
      </Typography>
    )
  )
}, "SelectedDonate")