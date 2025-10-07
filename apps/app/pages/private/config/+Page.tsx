import { useUpdate } from "@reatom/npm-react";
import { action } from "@reatom/core"
import { Options } from "@/shared/components/app/private/components/options";
import { optionsAction } from "@/shared/components/app/private/models/options.model";
import { Entities } from "@/shared/components/app/private/components/entities";

const startEventsAction = action((ctx) => {
  optionsAction(ctx)
}, "startEventsAction")

export default function Page() {
  useUpdate(startEventsAction, [])

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Options />
      </div>
      <div className="flex flex-col gap-4 w-full h-full p-4 rounded-xl bg-neutral-800/40">
        <Entities />
      </div>
    </div>
  )
}