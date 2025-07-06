import { ShopNickname } from "./shop-list-wallets"
import { Typography } from "@repo/ui/typography"
import { reatomComponent } from "@reatom/npm-react"
import { Skeleton } from "@repo/ui/skeleton"
import { Donates, itemsResource, storeItem } from "./store.model"
import { ItemsNotFound } from "./items-not-found"
import { ItemFooter } from "./store-childs"

const DonatesListSkeleton = () => {
  return (
    <>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </>
  )
}

const DonateItem = ({ description, origin, title, price, imageUrl }: Donates) => {
  return (
    <div className="flex flex-col items-center w-full gap-4 overflow-hidden rounded-lg p-2 bg-neutral-800">
      <div className="flex items-center justify-center bg-neutral-600/40 p-4 rounded-lg">
        <img src={imageUrl} width={48} height={48} alt="" className="min-h-[48px] min-w-[48px]" />
      </div>
      <div className="flex flex-col w-full justify-center items-center">
        <Typography className="text-xl" color="white">
          {title}
        </Typography>
        <Typography color="gray" className="truncate w-full text-center">
          {description}
        </Typography>
      </div>
      <ItemFooter price={price} value={origin} />
    </div>
  )
}

export const DonatesList = reatomComponent(({ ctx }) => {
  const donates = ctx.spy(itemsResource.dataAtom) as Donates[]

  if (ctx.spy(itemsResource.statusesAtom).isPending) {
    return <DonatesListSkeleton />
  }

  if (!donates) return <ItemsNotFound />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-auto gap-4 w-full h-full">
      {donates.map(item => (
        <DonateItem key={item.origin} {...item} />
      ))}
    </div>
  )
}, "DonatesList")

export const SelectedDonate = reatomComponent(({ ctx }) => {
  const shopItemState = ctx.spy(storeItem)
  const currentDonates = ctx.spy(itemsResource.dataAtom) as Donates[]

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