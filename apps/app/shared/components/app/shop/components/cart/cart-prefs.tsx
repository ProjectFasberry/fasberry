import { reatomComponent } from "@reatom/npm-react";
import { Input } from "@repo/ui/input";
import {
  changeGlobalRecipientAction, changeGlobalRecipientErrorAtom, changeGlobalRecipientIsValidAtom, changeGlobalRecipientNewAtom, changeGlobalRecipientOldAtom,
} from "../../models/store-recipient.model";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";

const GlobalRecipient = reatomComponent(({ ctx }) => {
  const oldRecipient = ctx.get(changeGlobalRecipientOldAtom) ?? ""
  const newRecipient = ctx.spy(changeGlobalRecipientNewAtom)

  const handle = () => changeGlobalRecipientAction(ctx)

  const isDisabled = !ctx.spy(changeGlobalRecipientIsValidAtom) || ctx.spy(changeGlobalRecipientAction.statusesAtom).isPending

  const error = ctx.spy(changeGlobalRecipientErrorAtom)

  return (
    <div className="flex flex-col gap-3 w-full sm:w-1/2">
      <Typography className="text-lg leading-tight">
        Получатель, который присваивается всем добавленным товарам в корзину.
      </Typography>
      <div className="flex border border-neutral-700 rounded-lg p-2">
        <Typography className="text-lg leading-tight">
          Если вы вошли в аккаунт, то это автоматически вы.
        </Typography>
      </div>
      <div className="flex flex-col gap-1">
        <Typography>
          Текущий получатель
        </Typography>
        <div className="flex flex-col sm:flex-row sm:items-center w-full justify-start gap-2">
          <Input
            value={newRecipient ?? oldRecipient}
            placeholder="Введите никнейм"
            onChange={e => changeGlobalRecipientNewAtom(ctx, e.target.value)}
            maxLength={32}
            className="[&[aria-invalid=true]]:border-red-500 peer border-transparent border-2"
            onClick={() => {
              changeGlobalRecipientErrorAtom.reset(ctx)
            }}
            aria-invalid={!!error}
          />
          <Button disabled={isDisabled} onClick={handle} className="px-6 w-fit bg-neutral-50">
            <Typography className="text-lg text-neutral-950 font-semibold">
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
    <div className='flex flex-col gap-2 w-full h-fit bg-neutral-900 p-3 sm:p-4 rounded-xl'>
      <GlobalRecipient />
    </div>
  )
}