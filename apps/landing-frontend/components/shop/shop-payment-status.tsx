import { Button } from "@repo/landing-ui/src/button"
import { Typography } from "@repo/landing-ui/src/typography"
import { Check, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "ky"

export const PAYMENT_STATUS_QUERY_KEY = ["shop", "payment", "status"]

export type GetOrderRequest = any

export type GetOrderResponse = any

export type PaymentStatusQuery = {
  current: string,
  paymentType: GetOrderRequest["query"]["type"],
  status: GetOrderResponse["data"]["status"],
  type: "created" | "error",
  isOpened: boolean,
  url: string
}

export const paymentStatusQuery = () => useQuery<PaymentStatusQuery, Error>({
  queryKey: PAYMENT_STATUS_QUERY_KEY,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
})

const paymentStatusMap: Record<PaymentStatusQuery["status"], string> = {
  'success': 'оплачен',
  'error': 'ошибка',
  'pending': 'ждет оплаты',
  "canceled": "отменен",
}

const ORDERS_API = ky.extend({
  prefixUrl: "https://api.fasberry.su/payment",
  credentials: "include"
})

async function getPaymentStatus(id: string, type: PaymentStatusQuery["paymentType"]) {
  const res = await ORDERS_API(`get-order/${id}`, {
    searchParams: {
      type
    }
  })

  const data = await res.json<{
    data: {
      status: "success" | "error" | "canceled" | "pending";
      nickname: string;
      created_at: Date | null;
      orderid: string;
      payment_type: string;
      payment_value: string;
    }
  } | { error: string }>()

  if (!data || "error" in data) {
    return { error: data.error };
  }

  return data.data;
}

const UPDATE_PAYMENT_STATUS_MUTATION_KEY = ["update-payment-status"]

const usePaymentStatus = () => {
  const qc = useQueryClient()

  const updatePaymentStatusMutation = useMutation({
    mutationKey: UPDATE_PAYMENT_STATUS_MUTATION_KEY,
    mutationFn: async (val: Pick<PaymentStatusQuery, "current" | "paymentType">) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return getPaymentStatus(val.current, val.paymentType)
    },
    onSuccess: async (data) => {
      if ("error" in data) {
        return qc.setQueryData(PAYMENT_STATUS_QUERY_KEY,
          (prev: PaymentStatusQuery) => ({ ...prev, status: 'error' })
        )
      }

      qc.setQueryData(PAYMENT_STATUS_QUERY_KEY,
        (prev: PaymentStatusQuery) => ({ ...prev, status: data.status })
      )
    },
    onError: e => { throw new Error(e.message) }
  })

  return { updatePaymentStatusMutation }
}

export const ShopPaymentStatus = () => {
  const { data: paymentStatus } = paymentStatusQuery()
  const { updatePaymentStatusMutation } = usePaymentStatus()

  if (!paymentStatus) return null;

  const isFinished = paymentStatus.status === 'success' || paymentStatus.status === 'canceled'

  const handleUpdate = () => {
    const { current, paymentType, status } = paymentStatus

    if (status !== 'pending') return;

    updatePaymentStatusMutation.mutate({ current, paymentType })
  }

  return (
    <div className="flex sm:flex-row flex-col items-center justify-between gap-4 bg-neutral-400 dark:bg-neutral-800 rounded-xl py-2 px-4 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {paymentStatus?.status === 'success' && (
          <Check size={18} className="text-green" />
        )}
        {paymentStatus?.status === 'pending' && (
          <svg viewBox="0 0 16 16" height="18" width="18" className="windows-loading-spinner">
            <circle r="7px" cy="8px" cx="8px"></circle>
          </svg>
        )}
        {paymentStatus?.status === 'error' && (
          <X size={18} className="text-red" />
        )}
        <Typography>
          Статус: {paymentStatusMap[paymentStatus?.status]}
        </Typography>
      </div>
      <Button
        disabled={updatePaymentStatusMutation.isPending || isFinished}
        onClick={handleUpdate}
        className="w-fit bg-neutral-100 rounded-lg py-2 px-6"
      >
        <Typography className="text-neutral-900 text-base">
          {updatePaymentStatusMutation.isPending ? "Обновляем..." : "Обновить"}
        </Typography>
      </Button>
    </div>
  )
}