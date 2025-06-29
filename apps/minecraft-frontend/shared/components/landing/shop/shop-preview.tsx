import { walletsMap } from "./shop-list-wallets";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { Donates, itemsResource, storeCategoryAtom, storeItem, storeTargetNickname } from "./store.model";

const titleMap: Record<string, string> = {
  donate: "Привилегия",
  wallet: "Валюта",
  events: "Ивент",
};

export const ShopFinishedPreview = reatomComponent(({ctx}) => {
  const shopItemState  = ctx.spy(storeItem)
  const shopItemNickname = ctx.spy(storeTargetNickname)
  const storeCategory = ctx.spy(storeCategoryAtom)

  if (!shopItemState.paymentType || !walletsMap) return null;

  const paymentType: string = storeCategory === 'donate'
    ? shopItemState.paymentValue as "arkhont" | "authentic" | "loyal"
    : shopItemState.paymentType

  const getSelectedDetails = () => {
    switch (shopItemState.paymentType) {
      case "donate":
        const currentDonates = ctx.get(itemsResource.dataAtom) as Donates[]

        const selDonate = currentDonates?.find(cd => cd.origin === shopItemState.paymentValue)

        return {
          title: selDonate?.title ?? "",
          description: selDonate?.description ?? "",
          img: selDonate?.imageUrl ?? ""
        }
      case "charism":
      case "belkoin":
        const selWallet = walletsMap[paymentType]

        if (!selWallet) return;

        return {
          title: selWallet.title,
          description: selWallet.description,
          img: walletsMap[paymentType]?.img
        }
    }
  }

  const details = getSelectedDetails()

  if (!details) return null;

  return (
    <div className="flex items-center select-none justify-start gap-4 w-full p-4 lg:p-6 rounded-xl bg-neutral-900">
      <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
        <img
          src={details.img}
          width={42}
          height={42}
          alt=""
          className="lg:w-[42px] lg:h-[42px] h-[32px] w-[32px]"
        />
      </div>
      <div className="flex flex-col">
        <Typography className="text-[20px]">
          {titleMap[storeCategory]} {details.title}
        </Typography>
        <Typography className="text-[18px]">
          для <span className="text-neutral-400 font-semibold">
            {shopItemNickname}
          </span>
        </Typography>
      </div>
    </div>
  )
}, "ShopFinishedPreview")