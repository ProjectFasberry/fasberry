import { Typography } from "@repo/landing-ui/src/typography";
import { walletsMap } from "./shop-list-wallets";
import { useQueryClient } from "@tanstack/react-query";
import { Donates, DONATES_QUERY_KEY } from "./shop-list-donates";
import { shopItemQuery } from "./shop";

const titleMap: Record<string, string> = {
  donate: "Привилегия",
  wallet: "Валюта",
  events: "Ивент",
};

export const ShopFinishedPreview = () => {
  const qc = useQueryClient()
  const { data: shopItemState } = shopItemQuery()

  if (!shopItemState || !shopItemState.paymentType || !walletsMap) return null;

  const paymentType: string = shopItemState.category === 'donate'
    ? shopItemState.paymentValue as "arkhont" | "authentic" | "loyal"
    : shopItemState.paymentType

  const getSelectedDetails = () => {
    switch (shopItemState.paymentType) {
      case "donate":
        const currentDonates = qc.getQueryData<Donates[]>(DONATES_QUERY_KEY("donate"));

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
    <div className="flex items-center select-none justify-start gap-4 w-full p-4 lg:p-6 rounded-xl bg-neutral-400 dark:bg-neutral-900">
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
          {titleMap[shopItemState.category]} {details.title}
        </Typography>
        <Typography className="text-[18px]">
          для <span className="text-neutral-600 dark:text-neutral-400 font-semibold">
            {shopItemState?.nickname}
          </span>
        </Typography>
      </div>
    </div>
  )
}