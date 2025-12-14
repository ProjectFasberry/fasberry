import { reatomComponent } from "@reatom/npm-react";
import { Input } from "@repo/ui/input";
import {
  changeGlobalRecipientAction, 
  changeGlobalRecipientErrorAtom, 
  changeGlobalRecipientIsValidAtom, 
  changeGlobalRecipientNewAtom, 
  changeGlobalRecipientOldAtom,
} from "../../models/store-recipient.model";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";
import { atom } from "@reatom/core";

const isDisabledAtom = atom((ctx) =>
  !ctx.spy(changeGlobalRecipientIsValidAtom) || ctx.spy(changeGlobalRecipientAction.statusesAtom).isPending,
  "isDisabled"
)

const GlobalRecipient = reatomComponent(({ ctx }) => {
  const oldRecipient = ctx.get(changeGlobalRecipientOldAtom) ?? ""
  const newRecipient = ctx.spy(changeGlobalRecipientNewAtom)

  const error = ctx.spy(changeGlobalRecipientErrorAtom)

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full h-full gap-1">
        <div className="flex flex-col h-full min-w-0">
          <Typography className="text-lg truncate text-nowrap">
            Текущий получатель
          </Typography>
          <Typography className="text-sm text-neutral-400 leading-5 tracking-6">
            Получатель, который присваивается всем добавленным товарам в корзину.
          </Typography>
        </div>
        <div className="flex items-center min-w-0 lg:justify-end gap-2">
          <Input
            value={newRecipient ?? oldRecipient}
            placeholder="Введите никнейм"
            onChange={e => changeGlobalRecipientNewAtom(ctx, e.target.value)}
            maxLength={32}
            className="[&[aria-invalid=true]]:border-red-500 peer w-2/3 border-transparent border-2"
            onClick={() => {
              changeGlobalRecipientErrorAtom.reset(ctx)
            }}
            aria-invalid={!!error}
          />
          <Button
            disabled={ctx.spy(isDisabledAtom)}
            onClick={() => changeGlobalRecipientAction(ctx)}
            className="w-1/3 bg-neutral-50"
          >
            <Typography className="text-lg truncate text-neutral-950 font-semibold">
              Сохранить
            </Typography>
          </Button>
          {error && (
            <span className="text-red-500 text-sm">{error}</span>
          )}
        </div>
      </div>
    </div>
  )
}, "GlobalRecipient")

export const CartPrefs = () => {
  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <Typography className="text-3xl font-semibold">
        Настройки
      </Typography>
      <div className="flex flex-col gap-4 w-full h-full">
        <GlobalRecipient />
      </div>
    </div>
  )
}