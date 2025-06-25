import { StartPayment } from "./subscription-item";
import { ShopSelectCurrency } from "./shop-select-currency";
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import { ShopPrice } from "./shop-price";
import { Typography } from "@/shared/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { storeItem, storeTargetNickname } from "./store.model";

export const ShopFooter = reatomComponent(({ ctx }) => {
  const shopItemState = ctx.spy(storeItem)
  const nickname = ctx.spy(storeTargetNickname)

  const isValid = shopItemState
    ? shopItemState.paymentType && shopItemState.paymentValue : false

  if (!isValid) return null;

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
        <ShopSelectCurrency />
      </div>
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 justify-center w-fit rounded-lg">
          <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
            <img src={ExpActive} width={36} height={36} alt="" />
          </div>
          <div className="flex flex-col">
            <Typography color="gray" className="text-base">
              Стоимость
            </Typography>
            <ShopPrice />
          </div>
        </div>
        <div className="flex items-center w-fit">
          <StartPayment
            trigger={
              <button
                disabled={!isValid || !nickname}
                className="btn disabled:opacity-50 hover:bg-[#05b458] !bg-[#088d47]"
              >
                <Typography color="white" className="text-lg">
                  Приобрести
                </Typography>
              </button>
            }
          />
        </div>
      </div>
    </>
  )
}, "ShopFooter")