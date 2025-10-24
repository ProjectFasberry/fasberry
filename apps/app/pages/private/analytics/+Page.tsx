import { client, withAbort, withQueryParams } from "@/shared/lib/client-wrapper";
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { atom, Ctx } from "@reatom/core";
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area, TooltipContentProps } from 'recharts';
import { ResponsiveContainer } from 'recharts';

type ChartData = {
  label: string;
  registrations: number;
};

interface Props {
  data: { label: string; registrations: number }[];
  title: string;
}

const registrationsTypeAtom = atom<"day" | "month" | "hour">("day", "registrationsType")
const registrationsHourMin = atom(0)

function refetchRegistrations(ctx: Ctx) {
  registrationsChartsAction.cacheAtom.reset(ctx)
  registrationsChartsAction(ctx)
}

registrationsTypeAtom.onChange((ctx, state) => {
  refetchRegistrations(ctx)
})

const registrationsChartsAction = reatomAsync(async (ctx) => {
  const type = ctx.get(registrationsTypeAtom);

  return await ctx.schedule(() =>
    client<ChartData[]>("privated/analytics/registrations")
      .pipe(withQueryParams({ type }), withAbort(ctx.controller.signal))
      .exec()
  )
}, "registrationsChartsAction").pipe(
  withDataAtom(null),
  withStatusesAtom(),
  withCache({ swr: false })
)

function CustomTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-green-600">{value} регистраций</p>
    </div>
  );
}

function RegistrationsChart({ data, title }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full h-80">
      <h3 className="text-2xl font-semibold">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-green-300)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--color-green-500)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--color-neutral-400)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            width={40}
            tickLine={false}
            axisLine={false}
            domain={[0, (dataMax: number) => Math.max(dataMax, 20)]}
          />
          <Tooltip content={CustomTooltip} />
          <Area
            type="monotone"
            dataKey="registrations"
            stroke="var(--color-green-500)"
            fill="url(#colorRegistrations)"
            strokeWidth={4}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const TYPES = [
  { title: "По часам", value: "hour" },
  { title: "По дням", value: "day" },
  { title: "По месяцам", value: "month" }
] as const

const RegistrationsSettings = reatomComponent(({ ctx }) => {
  const type = ctx.spy(registrationsTypeAtom);
  const isActive = (target: string) => type === target ? "active" : "inactive"

  return (
    <div className="flex items-center justify-start w-full gap-2">
      {TYPES.map(({ value, title }) => (
        <Button
          key={value}
          data-state={isActive(value)}
          className="bg-neutral-800 font-semibold data-[state=active]:bg-neutral-600"
          onClick={() => registrationsTypeAtom(ctx, value)}
        >
          {title}
        </Button>
      ))}
    </div>
  )
}, "RegistrationsSettings")

const Registrations = reatomComponent(({ ctx }) => {
  useUpdate(registrationsChartsAction, []);

  const data = ctx.spy(registrationsChartsAction.dataAtom);

  if (ctx.spy(registrationsChartsAction.statusesAtom).isPending) {
    return <Skeleton className="h-80 w-full" />
  }

  if (!data) return null;

  return <RegistrationsChart data={data} title="Регистрации" />
}, "Registrations")

export default function Page() {
  return (
    <>
      <div className="flex flex-col gap-8 border border-neutral-800 p-4 rounded-xl w-full h-full">
        <Registrations />
        <RegistrationsSettings />
      </div>
    </>
  )
}