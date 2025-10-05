import { Data } from "./+data";
import { Typography } from "@repo/ui/typography";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { connectToPaymentEvents, esAtom, orderDataAtom, orderRequestEventAtom } from "@/shared/components/app/shop/models/store-checkout.model";
import { PageLoader } from "@/shared/ui/page-loader";
import { action, atom } from "@reatom/core";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog";
import { IconCheck, IconCopy, IconEye } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { CreateOrderRoutePayload } from '@repo/shared/types/entities/payment';
import { Payment } from "@/shared/components/app/shop/models/store.model";
import { createLink, Link } from "@/shared/components/config/link";
import { Button } from "@repo/ui/button";
import { onConnect, onDisconnect, sleep } from "@reatom/framework";
import { pageContextAtom } from "@/shared/models/global.model";
import { startPageEvents } from "@/shared/lib/events";

type Product = {
  id: number;
  price: string;
  title: string;
  type: string;
  value: string;
  currency: string;
  recipient: string
}

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

  const data = pageContext.data as Data

  orderDataAtom(ctx, data.item)
}, "events")

orderRequestEventAtom.onChange(async (ctx, target) => {
  if (target === 'invoice_paid') {
    showOrderLoaderAtom(ctx, true)
    await sleep(2000)
    showOrderLoaderAtom(ctx, false)
  }
})

onConnect(esAtom, (ctx) => {
  const pageContext = ctx.get(pageContextAtom);
  if (!pageContext) return;

  if (pageContext.urlPathname.includes('/order')) {
    const uniqueId = pageContext.routeParams.id;
    connectToPaymentEvents(ctx, uniqueId)
  }
})

onDisconnect(esAtom, (ctx) => {
  const source = ctx.get(esAtom);

  if (source) {
    source.close()
    esAtom.reset(ctx)
  }
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
  let result = true;

  const target = ctx.spy(orderDataAtom)
  const es = ctx.spy(esAtom)

  if (target && es) result = false

  return result
}, "orderIsLoading")

function generatePricePayload(data: CreateOrderRoutePayload["payload"]["price"]): string {
  const parts = [
    data.global && `${data.global} ₽`,
    data.CHARISM && `${data.CHARISM} харизмы`,
    data.BELKOIN && `${data.BELKOIN} белкоинов`,
  ];

  return parts.filter(Boolean).join("\n");
}

function AutoWidthInput({ value }: { value: string }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(spanRef.current.offsetWidth);
    }
  }, [value]);

  return (
    <>
      <input
        readOnly
        value={value}
        style={{ width: inputWidth }}
        className="bg-transparent border-none outline-none text-neutral-50"
      />
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre"
        style={{ fontFamily: "monospace" }}
      >
        {value}
      </span>
    </>
  );
}

const OrderDetails = reatomComponent(({ ctx }) => {
  const [copied, setCopied] = useState(false);

  const data = ctx.spy(orderDataAtom)
  if (!data) return null

  const handleCopy = async () => {
    const paymentUrl = data.pay_url

    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col w-full">
        <Typography className='font-semibold text-white text-xl'>
          Ссылка для оплаты:
        </Typography>
        <div className="flex items-center relative cursor-pointer w-fit gap-2 bg-neutral-700 rounded-lg py-2 px-3 text-base">
          <AutoWidthInput value={data.pay_url} />
          <button onClick={handleCopy} className="group">
            <IconCopy size={16} className="text-neutral-400 group-hover:text-neutral-50" />
          </button>
        </div>
        {copied && <p className="text-green-500 text-base mt-1">Скопировано</p>}
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

  const payload: Product[] | null = JSON.parse(data.payload) ?? null;
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
          {payload && (
            <div className="flex flex-col gap-1 sm:w-2/3 bg-neutral-800/60 p-2 rounded-lg w-full">
              {payload.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-1 bg-neutral-700/60 rounded-lg p-2"
                >
                  <Typography className="font-semibold">{product.title}
                    <span className="font-normal text-neutral-400"> ({product.value})</span>
                  </Typography>
                  <span>Получатель: {product.recipient}</span>
                  <Link
                    href={createLink("store", product.id.toString())}
                    className="font-semibold w-fit"
                    target="_blank"
                  >
                    <Button className="bg-neutral-50 text-neutral-950 text-md py-1">
                      К товару
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
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