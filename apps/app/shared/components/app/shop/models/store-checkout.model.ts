import { reatomAsync } from "@reatom/async";
import { atom, Ctx } from "@reatom/core";
import { OrderEventPayload } from "@repo/shared/types/entities/payment";
import { toast } from "sonner";
import { Payment } from "./store.model";
import { withReset } from "@reatom/framework";

export const msgAtom = atom<OrderEventPayload | null>(null, "msg")
export const connectIsSuccessAtom = atom(false, "isSuccess")
export const esAtom = atom<EventSource | null>(null, "eventSource").pipe(withReset())
export const esDisconnectReasonAtom = atom<string>("", "esDisconnectReasonAtom")
export const orderRequestEventAtom = atom<OrderEventPayload["type"] | null>(null, "orderRequestEvent");

export const es = (url: string) => new EventSource(url, { withCredentials: true });

type MessageHandler = (payload: { ctx: Ctx }) => void

const MESSAGE_ACTIONS: Record<OrderEventPayload["type"], MessageHandler> = {
  "invoice_paid": ({ ctx }) => {
    orderDataAtom(ctx, (state) => state ? ({ ...state, status: "succeeded" }) : null)

    const source = ctx.get(esAtom)

    if (source) {
      esDisconnectReasonAtom(ctx, "invoice_paid")
      toast.warning(`Event source is disconnected. Reason: ${ctx.get(esDisconnectReasonAtom)}`)
      source.close()
    }
  },
  "canceled": ({ ctx }) => {
    orderDataAtom(ctx, (state) => state ? ({ ...state, status: "canceled" }) : null)
  }
}

msgAtom.onChange((ctx, target) => {
  if (!target) return;
  const action = MESSAGE_ACTIONS[target.type]
  orderRequestEventAtom(ctx, target.type)
  action({ ctx })
})

esAtom.onChange((ctx, target) => {
  if (!target) return;

  target.onopen = () => {
    import.meta.env.DEV && toast.success("Connected to payment events")
  }
  
  target.addEventListener("payload", (event) => {
    try {
      msgAtom(ctx, JSON.parse(event.data))
    } catch (e) {
      console.error('Failed to parse message data:', event.data, e);
    }
  })
})

export const targetPaymentIdAtom = atom<string>("", "targetPaymentId")
export const orderDataAtom = atom<Payment | null>(null, "orderData")

export const connectToPaymentEvents = reatomAsync(async (ctx, target: string) => {
  const url = `${import.meta.env.PUBLIC_ENV__API_PREFIX}/store/order/${target}/events`;

  targetPaymentIdAtom(ctx, target);

  return esAtom(ctx, es(url));
}, {
  name: "connectToPaymentEvents",
  onReject: (_, e) => e instanceof Error && toast.error(e.message)
})