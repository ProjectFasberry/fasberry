import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { validateNumber } from "@/shared/lib/validate-primitives";
import { Input } from "@repo/ui/input"
import type { Selectable } from "kysely"
import type { StoreEconomy } from "@repo/shared/types/db/auth-database-types"

type CurrentPriceProps = Pick<Selectable<StoreEconomy>, "type" | "imageUrl" | "description"> & { value: number }

const CurrentPrice = ({ type, value, imageUrl, description }: CurrentPriceProps) => {
  return (
    <div className="flex items-center">
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        *Текущий курс: 1&nbsp;
      </Typography>
      <img src={imageUrl} width={16} height={16} alt="" />
      <Typography className="text-[14px] text-neutral-600 dark:text-neutral-400">
        &nbsp;= {value} RUB
      </Typography>
    </div>
  )
}

const SelectWalletValue = reatomComponent(({ ctx }) => {
  const selectedValue = ""

  return (
    <div className="flex flex-col gap-2">
      <Typography className="text-[18px]">
        Укажите количество
      </Typography>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          maxLength={8}
          className="px-4 w-full lg:w-1/3"
          placeholder="Введите сумму"
          value={selectedValue}
          onChange={e => {
            const value = validateNumber(e.target.value);

            if (value !== null) {
              // storeItem(ctx, (state) => ({ ...state, value: value }))
            }
          }}
        />
      </div>
    </div>
  )
}, "SelectWalletValue")

// export const SelectedWallet = reatomComponent(({ ctx }) => {
//   const target = { type: "charism", value: 2 }

//   if (!target) return (
//     <Typography className="text-2xl">
//       Валюта не выбрана
//     </Typography>
//   )

//   return (
//     <>
//       <div className="flex flex-col w-full items-center justify-center">
//         <Typography className="text-lg md:text-xl lg:text-2xl">
//           {target.title}
//         </Typography>
//         <Typography color="gray" className="text-center text-sm md:text-base lg:text-lg">
//           {target.description}
//         </Typography>
//       </div>
//       <div className="flex flex-col gap-4 w-full h-full border-2 border-neutral-600/40 rounded-xl p-4">
//         <SelectWalletValue />
//         <CurrentPrice type={selectedWallet.type} value={selectedWallet.value} />
//       </div>
//     </>
//   )
// }, "SelectedWallet")