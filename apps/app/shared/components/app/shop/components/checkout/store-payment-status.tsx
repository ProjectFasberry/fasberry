import { reatomComponent } from "@reatom/npm-react"
import { Typography } from "@repo/ui/typography"
import { IconCheck, IconX } from "@tabler/icons-react"
import { paymentStatusAction, PaymentResult, paymentResult } from "../../models/store.model"

const STATUS: Record<PaymentResult["status"], string> = {
  'success': 'оплачен',
  'error': 'ошибка',
  'pending': 'ждет оплаты',
  "canceled": "отменен",
}

export const StorePaymentStatus = reatomComponent(({ctx}) => {
  const result = ctx.spy(paymentResult)
  if (!result) return null;

  const isFinished = result.status === 'success' || result.status === 'canceled'

  const handleUpdate = () => {
    const { current, paymentType, status } = result

    if (status !== 'pending') return;

    paymentStatusAction(ctx, { current, paymentType })
  }

  return (
    <div className="flex sm:flex-row flex-col items-center justify-between gap-4 bg-neutral-800 rounded-xl py-2 px-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {result?.status === 'success' && (
          <IconCheck size={18} className="text-green" />
        )}
        {result?.status === 'pending' && (
          <svg viewBox="0 0 16 16" height="18" width="18" className="windows-loading-spinner">
            <circle r="7px" cy="8px" cx="8px"></circle>
          </svg>
        )}
        {result?.status === 'error' && (
          <IconX size={18} className="text-red" />
        )}
        <Typography>
          Статус: {STATUS[result?.status]}
        </Typography>
      </div>
      <button
        disabled={ctx.spy(paymentStatusAction.statusesAtom).isPending || isFinished}
        onClick={handleUpdate}
        className="btn w-fit bg-neutral-100 rounded-lg py-2 px-6"
      >
        <Typography className="text-neutral-900 text-base">
          {ctx.spy(paymentStatusAction.statusesAtom).isPending ? "Обновляем..." : "Обновить"}
        </Typography>
      </button>
    </div>
  )
}, "ShopPaymentStatus")