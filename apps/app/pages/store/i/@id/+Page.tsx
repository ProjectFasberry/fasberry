import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { reatomComponent } from "@reatom/npm-react";
import { Donate } from "@repo/shared/types/db/payments-database-types";
import { useData } from "vike-react/useData"
import { Selectable } from "kysely"
import { Typography } from "@repo/ui/typography";
import { Data } from "./+data";

const SelectedDonate = reatomComponent(({ ctx }) => {
  // @ts-expect-error
  const data = useData<Data>().item as Selectable<Donate>

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col w-full items-center justify-center">
        <Typography className="text-lg md:text-xl lg:text-2xl">
          {data.title}
        </Typography>
        <Typography color="gray" className="text-center text-sm md:text-base lg:text-lg">
          {data.description}
        </Typography>
      </div>
      <div className="flex flex-col w-full gap-4 items-center overflow-auto max-h-[260px] justify-start border-2 border-neutral-600/40 rounded-xl p-4">
        <div className="flex flex-col w-full">
          <Typography className="text-[20px]">
            ⭐ Возможности на сервере:
          </Typography>
          <div className="flex flex-col w-full">
            {data.commands?.map((feature, idx) => (
              <Typography key={idx} className="text-base">
                ⏹ {feature}
              </Typography>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}, "SelectedDonate")

const Item = () => {
  const data = useData<Data>().item

  return (
    <div>
      <Typography className="text-lg font-semibold md:text-xl lg:text-2xl">
        {data.title}
      </Typography>
    </div>
  )
}

export default function StoreItem() {
  const data = useData<Data>().item
  if (!data) return null;

  return (
    <MainWrapperPage>
      {"commands" in data ? <SelectedDonate /> : <Item />}
    </MainWrapperPage>
  )
}