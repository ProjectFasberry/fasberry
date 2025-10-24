import { Options } from "@/shared/components/app/private/components/options";
import { Typography } from "@repo/ui/typography";
import { Methods } from "@/shared/components/app/private/components/methods";

export default function Page() {
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