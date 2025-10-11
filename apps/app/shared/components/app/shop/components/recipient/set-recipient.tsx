import {
  saveRecipientAction,
  setRecipientDialogIsOpenAtom,
  setRecipientErrorAtom,
  setRecipientIsSaveAtom,
  setRecipientTempValueAtom
} from "@/shared/components/app/shop/models/store-recipient.model";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Switch } from "@repo/ui/switch";
import { Typography } from "@repo/ui/typography";

const SetRecipientField = reatomComponent(({ ctx }) => {
  const error = ctx.spy(setRecipientErrorAtom);
  const value = ctx.spy(setRecipientTempValueAtom);

  return (
    <div className="flex flex-col w-full">
      <Typography>
        Текущий получатель
      </Typography>
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

const SetRecipientSave = reatomComponent(({ ctx }) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Typography className='font-semibold'>
          Больше не спрашивать
        </Typography>
        <Switch
          checked={ctx.spy(setRecipientIsSaveAtom)}
          onCheckedChange={v => setRecipientIsSaveAtom(ctx, v)}
        />
      </div>
      <Button
        className="text-lg font-semibold text-neutral-50 bg-green-600"
        onClick={() => saveRecipientAction(ctx)}
        disabled={ctx.spy(saveRecipientAction.statusesAtom).isPending}
      >
        Сохранить
      </Button>
    </>
  )
}, "SetRecipientSave")

export const SetRecipientDialog = reatomComponent(({ ctx }) => {
  return (
    <Dialog open={ctx.spy(setRecipientDialogIsOpenAtom)} onOpenChange={v => setRecipientDialogIsOpenAtom(ctx, v)}>
      <DialogContent>
        <DialogTitle className="hidden">Получатель</DialogTitle>
        <div className="flex flex-col gap-4 w-full h-full">
          <div className="flex flex-col gap-2">
            <Typography className="text-xl font-semibold leading-tight text-neutral-50">
              Перед тем как добавить товар, нужно указать получателя.
            </Typography>
            <Typography className="text-neutral-300 text-base leading-tight">
              Получателем может быть только реально зарегистрированный игрок.
            </Typography>
            <Typography className="text-neutral-300 text-base leading-tight">
              Вы всегда можете изменить получателя товара в корзине.
            </Typography>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <SetRecipientField />
            <SetRecipientSave />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "SetRecipientDialog")