import { Data } from "./+data";
import { Typography } from "@repo/ui/typography";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { connectToOrderEventsAction, esAtom, orderDataAtom, orderRequestEventAtom } from "@/shared/components/app/shop/models/store-order.model";
import { PageLoader } from "@/shared/ui/page-loader";
import { action, atom } from "@reatom/core";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog";
import { IconCheck, IconCopy, IconEye } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Payment } from "@/shared/components/app/shop/models/store.model";
import { onDisconnect, sleep } from "@reatom/framework";
import { pageContextAtom } from "@/shared/models/global.model";
import { startPageEvents } from "@/shared/lib/events";
import { AutoWidthInput } from "@/shared/ui/autowidth-input";

const STATUSES: Record<Payment["status"], { title: string, color: string }> = {
  "canceled": {
    title: "Отменен", color: "text-yellow-500"
  },
  "pending": {
    title: "В ожидании оплаты", color: "text-neutral-50"
  },
  "succeeded": {
    title: "Оплачен", color: "text-green-500"
  },
  "waitingForCapture": {
    title: "В ожидании", color: "text-neutral-50"
  }
}

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  const { data } = pageContext.data as Data
  const uniqueId = pageContext.routeParams.id;

  orderDataAtom(ctx, data)
  connectToOrderEventsAction(ctx, uniqueId)
}, "events")

orderRequestEventAtom.onChange(async (ctx, target) => {
  if (target === 'invoice_paid') {
    showOrderLoaderAtom(ctx, true)
    await sleep(2000)
    showOrderLoaderAtom(ctx, false)
  }
})

onDisconnect(esAtom, (ctx) => {
  const source = ctx.get(esAtom);
  if (!source) return;

  source.close()
  esAtom.reset(ctx)
})

const showOrderLoaderAtom = atom(false, "showOrderLoader")

const OrderLoader = reatomComponent(({ ctx }) => {
  const isShow = ctx.spy(showOrderLoaderAtom);

  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (isShow) {
      setVisible(true);
      setAnimateOut(false);
      document.body.style.overflow = "hidden";
    } else if (visible) {
      setAnimateOut(true);

      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
    }
  }, [isShow]);

  if (!visible) return null;

  return (
    <div
      className={`flex z-[1000] items-center flex-col gap-4 fixed justify-center h-full w-full 
        ${animateOut ? "fade-out-background" : "fade-in-background"}`}
    >
      <IconCheck
        size={46}
        className={`text-green-500 ${animateOut ? "fade-out-icon" : "fade-in-and-scale-icon"}`}
      />
    </div>
  )
}, "OrderLoader")

const orderIsLoadingAtom = atom<boolean>((ctx) => {
  const target = ctx.spy(orderDataAtom)
  const es = ctx.spy(esAtom)
  const result = Boolean(target && es)
  console.log("orderIsLoadingAtom", result)
  return !result
}, "orderIsLoading")

const isCopiedAtom = atom(false, "isCopied")

const copyHrefAction = action(async (ctx, value: string) => {
  await navigator.clipboard.writeText(value);
  isCopiedAtom(ctx, true)
  await sleep(2000)
  isCopiedAtom(ctx, false)
})

const OrderDetails = reatomComponent(({ ctx }) => {
  const data = ctx.spy(orderDataAtom)
  if (!data) return null

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col w-full">
        <Typography className='font-semibold text-white text-xl'>
          Ссылка для оплаты:
        </Typography>
        <div className="flex items-center relative cursor-pointer w-fit gap-2 bg-neutral-700 rounded-lg py-2 px-3 text-base">
          <AutoWidthInput value={data.pay_url} />
          <button onClick={() => copyHrefAction(ctx, data.pay_url)} className="group">
            <IconCopy size={16} className="text-neutral-400 group-hover:text-neutral-50" />
          </button>
        </div>
        {ctx.spy(isCopiedAtom) && <p className="text-green-500 text-base mt-1">Скопировано</p>}
      </div>
    </div>
  )
}, "OrderDetails")

const OrderQR = ({ url }: { url: string }) => {
  return (
    <Dialog>
      <DialogTrigger
        className="flex items-center justify-center order-first sm:order-last 
        max-w-44 max-h-44 relative cursor-pointer p-0.5 group overflow-hidden rounded-md"
      >
        <div
          className="flex items-center w-full h-full justify-center group-hover:opacity-100 opacity-0 absolute bg-black/60 z-[2]"
        >
          <IconEye size={24} />
        </div>
        <QRCodeSVG value={url} className='w-full h-full' />
      </DialogTrigger>
      <DialogContent className="flex p-0 items-center justify-center">
        <QRCodeSVG value={url} className='w-full h-full' />
      </DialogContent>
    </Dialog>
  )
}

const Order = reatomComponent(({ ctx }) => {
  const data = ctx.spy(orderDataAtom)

  if (ctx.spy(orderIsLoadingAtom)) {
    return <PageLoader />
  }

  if (!data) return null

  const payload: string = data.payload;
  const status = STATUSES[data.status]

  return (
    <div className="flex sm:flex-row flex-col gap-4 items-center sm:items-start w-full">
      <div className="flex flex-col w-full h-full gap-2">
        <div className="flex items-center justify-start gap-2">
          <Typography className='font-semibold text-white text-2xl'>
            Заказ
          </Typography>
          <div className="flex items-center justify-center px-2 py-1 bg-neutral-50 rounded-md">
            <span className="font-semibold text-neutral-950">
              #{data.unique_id}
            </span>
          </div>
        </div>
        <Typography className="font-semibold text-xl">
          Статус: <span className={`font-normal text-base ${status.color}`}>
            {status.title}
          </span>
        </Typography>
        <div className="flex flex-col">
          <Typography className="font-semibold text-xl">
            Содержимое:
          </Typography>
          <span>{payload}</span>
        </div>
        <OrderDetails />
      </div>
      <OrderQR url={data.pay_url} />
    </div>
  )
}, "Order")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events, { urlTarget: "order" }), [pageContextAtom])

  return (
    <>
      <OrderLoader />
      <MainWrapperPage>
        <Order />
      </MainWrapperPage>
    </>
  )
}