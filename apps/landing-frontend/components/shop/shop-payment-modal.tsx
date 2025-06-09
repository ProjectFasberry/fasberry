import { Dialog, DialogClose, DialogContent } from "@repo/landing-ui/src/dialog"
import { ShopAreaItem } from "./shop-area"
import { Typography } from "@repo/landing-ui/src/typography"
import Link from "next/link"
import { Button } from "@repo/landing-ui/src/button"
import { useQueryClient } from "@tanstack/react-query"
import Duo from '@repo/assets/gifs/duo.gif';
import { PAYMENT_STATUS_QUERY_KEY, paymentStatusQuery, PaymentStatusQuery, ShopPaymentStatus } from "./shop-payment-status"
import { ShopFinishedPreview } from "./shop-preview"

export const ShopPaymentModal = () => {
  const qc = useQueryClient()
  const { data: paymentStatus } = paymentStatusQuery()

  if (!paymentStatus) return null;

  const isFinished = paymentStatus.status === 'success' || paymentStatus.status === 'canceled'

  const handleChange = (v: boolean) => {
    qc.setQueryData(PAYMENT_STATUS_QUERY_KEY,
      (prev: PaymentStatusQuery) => ({ ...prev, isOpened: v })
    )
  }

  const handleClose = () => {
    if (isFinished) {
      qc.resetQueries({ queryKey: PAYMENT_STATUS_QUERY_KEY })

      return;
    }
  }

  return (
    <Dialog
      open={paymentStatus?.isOpened ?? false}
      onOpenChange={handleChange}
    >
      <DialogContent className="!max-w-3xl">
        <ShopAreaItem image={Duo.src}>
          <div className="flex flex-col items-center w-full gap-4">
            <div className="flex flex-col">
              <Typography className="text-xl text-center">
                Заказ создан
              </Typography>
              <Typography text_color="adaptiveGray" className="text-base text-center">
                У вас есть 10 минут для того, чтобы оплатить заказ
              </Typography>
            </div>
            <ShopFinishedPreview />
            <div className="flex items-center gap-4">
              {!isFinished && (
                <Link
                  href={paymentStatus.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full lg:w-fit group hover:bg-[#05b458] transition-all duration-300
                    ease-in-out bg-[#088d47] rounded-lg py-4 px-12"
                >
                  <Typography className="text-[20px] !text-white font-semibold">
                    Оплатить
                  </Typography>
                </Link>
              )}
              {isFinished && (
                <DialogClose onClick={handleClose}>
                  <Button
                    className="w-full lg:w-fit group bg-neutral-700 transition-all duration-300
                      ease-in-out rounded-lg py-4 px-12"
                  >
                    <Typography className="text-[20px] !text-white font-semibold">
                      Вернуться
                    </Typography>
                  </Button>
                </DialogClose>
              )}
            </div>
            <ShopPaymentStatus />
          </div>
        </ShopAreaItem>
      </DialogContent>
    </Dialog>
  )
}