import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { userParamAtom } from "../../player/models/player.model";
import { Typography } from "@repo/ui/typography";
import { API_PREFIX_URL } from "@/shared/env";

const getSkinDownloadUrl = (nickname: string) => `${API_PREFIX_URL}/server/skin/download/${nickname}`

export const SkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(userParamAtom)
  if (!nickname) return null;

  const downloadUrl = getSkinDownloadUrl(nickname)

  return (
    <Dialog open={dialogOpen} onOpenChange={v => setDialogOpen(v)}>
      <DialogTrigger asChild className="w-full">
        <Button className="bg-neutral-50 items-center justify-center h-12">
          <Typography className="text-lg font-semibold text-neutral-900">
            Скачать скин
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-none">
        <DialogTitle>Скачать скин?</DialogTitle>
        <div className="flex items-center justify-end gap-2 w-full">
          <DialogClose asChild>
            <Button className="font-semibold text-lg bg-red-700">
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
              <Typography className="text-neutral-950 font-semibold">
                Скачать
              </Typography>
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "SkinDownloadLink")