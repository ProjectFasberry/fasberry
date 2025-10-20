import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { action } from "@reatom/core"
import { Options } from "@/shared/components/app/private/components/options";
import { optionsAction } from "@/shared/components/app/private/models/options.model";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { client, withAbort, withJsonBody } from "@/shared/lib/client-wrapper";
import { logError } from "@/shared/lib/log";
import { startPageEvents } from "@/shared/lib/events";
import { PrivatedMethodsPayload } from "@repo/shared/types/entities/other";
import { Typography } from "@repo/ui/typography";
import { Switch } from "@repo/ui/switch";
import { toast } from "sonner";
import { Skeleton } from "@repo/ui/skeleton";
import { pageContextAtom } from "@/shared/models/page-context.model";
import { DEFAULT_SOFT_TIMEOUT } from "@/shared/components/app/shop/models/store.model";
import { sleep } from "@reatom/framework";

const methodsAction = reatomAsync(async (ctx) => {
  await ctx.schedule(() => sleep(DEFAULT_SOFT_TIMEOUT));

  return await ctx.schedule(() =>
    client<PrivatedMethodsPayload>("privated/store/methods/list")
      .pipe(withAbort(ctx.controller.signal))
      .exec()
  )
}).pipe(withDataAtom(), withStatusesAtom(), withCache({ swr: false }))

const editMethodAction = reatomAsync(async (ctx, method: string, key: string, value: boolean | string) => {
  const body = { key, value }

  const result = await ctx.schedule(() =>
    client
      .post<{ [key: string]: string | boolean }>(`privated/store/methods/edit/${method}`)
      .pipe(withJsonBody(body))
      .exec()
  )

  return { method, result }
}, {
  name: "editMethodAction",
  onFulfill: (ctx, { result, method }) => {
    toast.success("Изменения применены");

    methodsAction.cacheAtom.reset(ctx);

    methodsAction.dataAtom(ctx, (state) => {
      if (!state) return undefined;

      return state.map((item) =>
        item.value === method
          ? { ...item, ...result }
          : item
      );
    })
  },
  onReject: (_, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())

const Method = reatomComponent<PrivatedMethodsPayload[number]>(({ ctx, id, value, imageUrl, title, isAvailable }) => {
  return (
    <div key={id} className="flex justify-start items-center h-16 w-full">
      <div className="flex items-center gap-2">
        <img src={imageUrl} alt="" width={56} height={56} className="min-h-14 min-w-14 h-14 w-14" />
        <Typography className="text-lg font-semibold">
          {title}
        </Typography>
      </div>
      <div className="flex items-center gap-2 w-full h-full">
        <Typography className="text-lg">
          Доступно:
        </Typography>
        <Switch
          checked={isAvailable}
          onCheckedChange={v => editMethodAction(ctx, value, "isAvailable", !isAvailable)}
          disabled={ctx.spy(editMethodAction.statusesAtom).isPending}
        />
      </div>
    </div>
  )
}, "Method")

const MethodsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </>
  )
}

const Methods = reatomComponent(({ ctx }) => {
  const data = ctx.spy(methodsAction.dataAtom);

  if (ctx.spy(methodsAction.statusesAtom).isPending) {
    return <MethodsSkeleton />
  }

  if (!data) return null;

  return data.map((method) => <Method key={method.id} {...method} />)
}, "Methods")

const events = action((ctx) => {
  optionsAction(ctx)
  methodsAction(ctx)
}, "events")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom])

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Typography className="text-xl font-bold">
          Глобальные параметры
        </Typography>
        <div className="flex flex-col gap-1 w-full h-full">
          <Options />
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Typography className="text-xl font-bold">
          Платежные методы
        </Typography>
        <div className="flex flex-col gap-1 w-full h-full">
          <Methods />
        </div>
      </div>
    </div>
  )
}