import { ShopAreaItem } from "./shop-area"
import Duo from '@repo/assets/gifs/duo.gif';
import { ShopFinishedPreview } from "./shop-preview"
import { Typography } from "@/shared/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { paymentResultDialogIsOpen, paymentResult } from "./store.model";
import { ShopPaymentStatus } from "./shop-payment-status";
import { Dialog, DialogClose, DialogContent } from "@/shared/ui/dialog";

export const ShopPaymentModal = reatomComponent(({ctx}) => {
  const result = ctx.spy(paymentResult)
  if (!result) return null;

  const isFinished = result.status === 'success' || result.status === 'canceled'

  return (
    <Dialog
      open={ctx.spy(paymentResultDialogIsOpen)}
      onOpenChange={v => paymentResultDialogIsOpen(ctx, v)}
    >
      <DialogContent className="!max-w-3xl">
        <ShopAreaItem image={Duo}>
          <div className="flex flex-col items-center w-full gap-4">
            <div className="flex flex-col">
              <Typography className="text-xl text-center">
                Заказ создан
              </Typography>
              <Typography color="gray" className="text-base text-center">
                У вас есть 10 минут для того, чтобы оплатить заказ
              </Typography>
            </div>
            <ShopFinishedPreview />
            <div className="flex items-center gap-4">
              {!isFinished && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full lg:w-fit hover:bg-[#05b458] duration-300 bg-[#088d47] rounded-lg py-4 px-12"
                >
                  <Typography color="white" className="text-[20px] font-semibold">
                    Оплатить
                  </Typography>
                </a>
              )}
              {isFinished && (
                <DialogClose>
                  <button
                    className="btn w-full lg:w-fit bg-neutral-700 duration-300 rounded-lg py-4 px-12"
                  >
                    <Typography color="white" className="text-[20px] font-semibold">
                      Вернуться
                    </Typography>
                  </button>
                </DialogClose>
              )}
            </div>
            <ShopPaymentStatus />
          </div>
        </ShopAreaItem>
      </DialogContent>
    </Dialog>
  )
}, "ShopPaymentModal")