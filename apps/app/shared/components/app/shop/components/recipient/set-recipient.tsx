import {
  saveRecipientAction,
  setRecipientDialogIsOpenAtom,
  setRecipientErrorAtom,
  setRecipientIsSaveAtom,
  setRecipientTempValueAtom
} from "@/shared/components/app/shop/models/store-recipient.model";
import { spawn } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";
import { addItemToCartAction } from "../../models/store-cart.model";

const SetRecipientField = reatomComponent(({ ctx }) => {
  const error = ctx.spy(setRecipientErrorAtom);
  const value = ctx.spy(setRecipientTempValueAtom);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-1 w-full">
        <Input
          value={value}
          onChange={e => setRecipientTempValueAtom(ctx, e.target.value)}
          placeholder="Введите никнейм"
          className="[&[aria-invalid=true]]:border-red-500 peer border-transparent border-2"
          onClick={() => { setRecipientErrorAtom.reset(ctx) }}
          aria-invalid={!!error}
        />
        {error && <span className='text-sm text-red-500'>{error}</span>}
      </div>
    </div>
  )
}, "SetRecipientField")

const SetRecipientPreference = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center gap-3 w-full justify-end">
      <Switch
        checked={ctx.spy(setRecipientIsSaveAtom)}
        onCheckedChange={v => setRecipientIsSaveAtom(ctx, v)}
      />
      <Typography className='text-lg font-semibold'>
        Больше не спрашивать
      </Typography>
    </div>
  )
}, "SetRecipientPreference")

const SetRecipientSave = reatomComponent(({ ctx }) => {
  const handle = () => void spawn(ctx, async (spawnCtx) => saveRecipientAction(spawnCtx, addItemToCartAction))

  return (
    <Button
      className="bg-neutral-50"
      onClick={handle}
      disabled={ctx.spy(saveRecipientAction.statusesAtom).isPending}
    >
      <Typography className="text-lg font-semibold text-neutral-950">
        Сохранить
      </Typography>
    </Button>
  )
}, "SetRecipientSave")

export const SetRecipientDialog = reatomComponent(({ ctx }) => {
  return (
    <Dialog open={ctx.spy(setRecipientDialogIsOpenAtom)} onOpenChange={v => setRecipientDialogIsOpenAtom(ctx, v)}>
      <DialogContent>
        <DialogTitle className="text-center text-2xl">Получатель</DialogTitle>
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="flex flex-col gap-2">
            <Typography className="text-lg font-semibold leading-tight text-neutral-50">
              Перед тем как добавить этот товар в корзину, нужно указать его получателя.
              Вы всегда можете изменить получателя товара в корзине.
            </Typography>
            <div className="flex border border-neutral-700 rounded-lg p-2">
              <Typography className="text-neutral-300 text-base leading-tight">
                Получателем может быть только реально зарегистрированный игрок.
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <SetRecipientField />
            <SetRecipientPreference />
            <SetRecipientSave />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "SetRecipientDialog")