import { Action, action, atom, Ctx } from "@reatom/core";
import { AsyncAction, AsyncStatusesAtom, ControlledPromise, sleep, withReset } from "@reatom/framework";
import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Typography } from "@repo/ui/typography";

export const alertDialogIsOpenAtom = atom(false).pipe(withReset())
const alertDialogOptsAtom = atom<AlertDialogProps | null>(null, "alertDialogOpts").pipe(withReset())

export const openAlertDialogAction = action(async (ctx, args: AlertDialogProps) => {
  alertDialogOptsAtom(ctx, args);
  await sleep(200);
  alertDialogIsOpenAtom(ctx, true);
}, "openAlertDialogAction")

alertDialogIsOpenAtom.onChange(async (ctx, state) => {
  if (!state) {
    await sleep(200);
    closeAlertDialogAction(ctx)
  }
})

export const closeAlertDialogAction = action((ctx) => {
  const opts = ctx.get(alertDialogOptsAtom);
  if (!opts) return;

  const rollback = opts.rollbackAction;

  if (rollback) {
    rollback(ctx)
  }
  
  alertDialogOptsAtom.reset(ctx)
})

type AlertDialogProps = {
  title: string,
  description: string,
  action: Action,
  actionTitle: string,
  rollbackAction?: Action,
  closeAfterAction?: boolean
}

export const AlertDialog = reatomComponent(({ ctx }) => {
  const opts = ctx.spy(alertDialogOptsAtom);
  if (!opts) return null;

  const { title, action, actionTitle, description } = opts

  return (
    <Dialog open={ctx.spy(alertDialogIsOpenAtom)} onOpenChange={v => alertDialogIsOpenAtom(ctx, v)}>
      <DialogContent>
        <DialogTitle className='text-center text-2xl font-bold'>Подтверждение действия</DialogTitle>
        <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
          <div className="flex w-full flex-col gap-1 min-w-0">
            <Typography className="text-wrap font-semibold text-lg truncate">
              {title}
            </Typography>
            <Typography className="leading-tight text-neutral-300">
              {description}
            </Typography>
          </div>
          <div className="flex items-center justify-end gap-2 w-full h-full">
            <DialogClose onClick={() => closeAlertDialogAction(ctx)} asChild>
              <Button className="font-semibold text-neutral-50 border-2 border-neutral-700 text-lg">
                Отмена
              </Button>
            </DialogClose>
            <Button onClick={() => action(ctx)} className="bg-neutral-50 text-neutral-950 font-semibold text-lg">
              {actionTitle}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "AlertDialog")