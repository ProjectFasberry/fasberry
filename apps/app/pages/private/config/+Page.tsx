import { useUpdate } from "@reatom/npm-react";
import { action } from "@reatom/core"
import { Options } from "@/shared/components/app/private/components/options";
import { Actions } from "@/shared/components/app/private/components/actions";
import { PropsWithChildren } from "react";
import { Typography } from "@repo/ui/typography";
import { optionsAction } from "@/shared/components/app/private/models/options.model";
import { Entities } from "@/shared/components/app/private/components/entities";

const startEventsAction = action((ctx) => {
  optionsAction(ctx)
}, "startEventsAction")

const Wrapper = ({ children, title }: PropsWithChildren & { title: string }) => {
  return (
    <div className="p-4 rounded-xl bg-neutral-800/40 w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full">
        <Typography className="text-2xl text-neutral-50 font-semibold">
          {title}
        </Typography>
        {children}
      </div>
    </div>
  )
}

export default function Page() {
  useUpdate(startEventsAction, [])

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Wrapper title="Конфиг">
        <Options />
      </Wrapper>
      <Wrapper title="Действия">
        <Actions />
      </Wrapper>
      <Wrapper title="Сущности">
        <Entities />
      </Wrapper>
    </div>
  )
}