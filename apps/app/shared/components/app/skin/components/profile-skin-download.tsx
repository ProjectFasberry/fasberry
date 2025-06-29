import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { userParam } from "@/shared/api/global.model";

export const ProfileSkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(userParam)
  if (!nickname) return null;

  const downloadUrl = `https://api.fasberry.su/minecraft/skin/download-skin/${nickname}`

  return (
    <Dialog open={dialogOpen} onOpenChange={v => setDialogOpen(v)}>
      <DialogTrigger asChild className="w-full">
        <Button className="bg-neutral-50 items-center justify-center h-[46px]">
          <p className="text-md font-semibold text-neutral-900">
            Скачать скин
          </p>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-none">
        <DialogTitle>Скачать скин?</DialogTitle>
        <div className="flex items-center justify-end gap-2 w-full">
          <DialogClose>
            <button className="btn">
              Отмена
            </button>
          </DialogClose>
          <a
            href={downloadUrl}
            onClick={() => setDialogOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn bg-neutral-50 py-2 flex items-center px-6 justify-center"
          >
            <p className="text-neutral-950 text-base font-medium">
              Скачать
            </p>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinDownloadLink")