import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { userParam } from "../../player/models/player.model";

export const ProfileSkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(userParam)
  if (!nickname) return null;

  const downloadUrl = `https://api.fasberry.su/minecraft/server/skin/download/${nickname}`

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
            <Button className="font-semibold bg-red-700 hover:bg-red-800">
              Отмена
            </Button>
          </DialogClose>
          <a
            href={downloadUrl}
            onClick={() => setDialogOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button className="flex bg-neutral-50 items-center justify-center">
              <p className="font-semibold text-neutral-950 text-base">
                Скачать
              </p>
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinDownloadLink")