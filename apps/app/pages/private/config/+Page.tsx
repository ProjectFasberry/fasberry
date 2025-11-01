import { Options } from "@/shared/components/app/private/components/options";
import { Typography } from "@repo/ui/typography";
import { Methods } from "@/shared/components/app/private/components/methods";
import { Roles } from "@/shared/components/app/private/components/roles";
import { Dictionaries, DictionariesHeader } from "@/shared/components/app/private/components/dictionaries";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 h-full w-full">
        <div className="flex flex-col gap-4 bg-neutral-900 rounded-xl p-4 w-full">
          <Typography className="text-xl font-bold">
            Глобальные параметры
          </Typography>
          <div className="flex flex-col gap-1 w-full h-full">
            <Options />
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-neutral-900 rounded-xl p-4 w-full">
          <Typography className="text-xl font-bold">
            Платежные методы
          </Typography>
          <div className="flex flex-col gap-1 w-full h-full">
            <Methods />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-neutral-900 rounded-xl p-4 w-full h-full">
        <Typography className="text-xl font-bold">
          Роли
        </Typography>
        <div className="flex flex-col gap-1 w-full h-full">
          <Roles />
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-neutral-900 rounded-xl p-4 w-full h-full">
        <DictionariesHeader />
        <div className="flex flex-col gap-1 w-full h-full">
          <Dictionaries />
        </div>
      </div>
    </div>
  )
}