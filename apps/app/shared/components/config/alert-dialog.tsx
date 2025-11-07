import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { Typography } from "@repo/ui/typography";
import { alertDialogIsOpenAtom, alertDialogConfigAtom, alertDialog } from "./alert-dialog.model";

export const AlertDialog = reatomComponent(({ ctx }) => {
  const opts = ctx.spy(alertDialogConfigAtom);
  if (!opts) return null;

  const { title, confirmAction, confirmLabel, description } = opts

  return (
    <Dialog open={ctx.spy(alertDialogIsOpenAtom)} onOpenChange={v => alertDialogIsOpenAtom(ctx, v)}>
      <DialogContent>
        <DialogTitle className='text-center text-2xl'>
          Подтверждение действия
        </DialogTitle>
        <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
          <div className="flex w-full flex-col gap-1 min-w-0">
            <Typography className="text-wrap font-semibold text-lg truncate">
              {title}
            </Typography>
            <Typography className="leading-tight text-neutral-300">
              {description ?? "Это действие нельзя отменить"}
            </Typography>
          </div>
          <div className="flex items-center justify-end gap-2 w-full h-full">
            <DialogClose asChild>
              <Button
                onClick={() => alertDialog.close(ctx)}
                className="border-2 border-neutral-700"
              >
                <Typography className="text-neutral-50 font-semibold text-lg">
                  Отмена
                </Typography>
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                onClick={() => confirmAction(ctx)}
                className="bg-neutral-50"
              >
                <Typography className="text-neutral-950 font-semibold text-lg">
                  {confirmLabel}
                </Typography>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "AlertDialog")