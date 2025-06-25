import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { requestedUserParamAtom } from "../models/skin.model";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/shared/ui/dialog';

export const ProfileSkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(requestedUserParamAtom)
  if (!nickname) return null;

  const downloadUrl = `https://api.fasberry.su/minecraft/skin/download-skin/${nickname}`

  return (
    <Dialog open={dialogOpen} onOpenChange={v => setDialogOpen(v)}>
      <DialogTrigger asChild>
        <button className="bg-neutral-50 items-center justify-center flex w-full h-[46px]">
          <p className="text-md font-semibold text-neutral-900">
            Скачать скин
          </p>
        </button>
      </DialogTrigger>
      <DialogContent>
        <div title="Скачать скин?">
          <a
            href={downloadUrl}
            onClick={() => setDialogOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="bg-shark-50 flex items-center px-6 justify-center rounded-md"
          >
            <p className="text-shark-950 text-base font-medium">
              Скачать
            </p>
          </a>
          <DialogClose>
            <button className="btn">
              Отмена
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinDownloadLink")