import { StartPayment } from "./subscription-item";
import { ShopSelectCurrency } from "./shop-select-currency";
import { Button } from "@repo/landing-ui/src/button";
import { Typography } from "@repo/landing-ui/src/typography";
import ExpActive from "@repo/assets/images/minecraft/exp-active.webp"
import { ShopPrice } from "./shop-price";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SHOP_ITEM_QUERY_KEY, shopItemQuery, ShopItemQuery } from "./shop";

export const usePayment = () => {
  const qc = useQueryClient()

  const updatePaymentDetailsMutation = useMutation({
    mutationFn: async (val: Partial<ShopItemQuery>) => {
      return qc.setQueryData(SHOP_ITEM_QUERY_KEY, (prev: ShopItemQuery) => ({
        ...prev, ...val,
      }));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: SHOP_ITEM_QUERY_KEY }),
    onError: (e) => {
      throw new Error(e.message);
    },
  })

  return { updatePaymentDetailsMutation }
}

export const ShopFooter = () => {
  const { data: shopItemState } = shopItemQuery()
  const { updatePaymentDetailsMutation } = usePayment();

  const nickname = shopItemState?.nickname;

  const startPayment = () => {
    if (!nickname || !shopItemState) return;

    updatePaymentDetailsMutation.mutate({
      nickname,
      paymentType: shopItemState.paymentType,
      paymentValue: shopItemState.paymentValue
    })
  }

  const isValid = shopItemState
    ? !!shopItemState.paymentType && !!shopItemState.paymentValue
    : false

  if (!isValid) return null;

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
        <ShopSelectCurrency />
      </div>
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between
            gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 justify-center w-fit rounded-lg">
          <div className="flex items-center justify-center bg-neutral-600/40 p-2 rounded-lg">
            <img src={ExpActive.src} width={36} height={36} alt="" />
          </div>
          <div className="flex flex-col">
            <Typography className="text-[16px] text-neutral-600 dark:text-neutral-400">
              Стоимость
            </Typography>
            <ShopPrice />
          </div>
        </div>
        <div className="flex items-center w-fit">
          <StartPayment trigger={
            <Button
              onClick={startPayment}
              disabled={!isValid}
              className="group hover:bg-[#05b458] transition-all duration-300 ease-in-out bg-[#088d47] rounded-lg px-6 py-4 "
            >
              <Typography className="text-[20px] text-white dark:text-white">
                Приобрести
              </Typography>
            </Button>
          } />
        </div>
      </div>
    </>
  )
}