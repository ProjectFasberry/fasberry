import { reatomComponent } from "@reatom/npm-react";
import { Button } from "@repo/ui/src/components/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@repo/ui/src/components/dialog";
import { Typography } from "@repo/ui/src/components/typography";
import { useState } from "react";
import { requestedUserParamAtom } from "../models/skin.model";

export const ProfileSkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(requestedUserParamAtom)
  if (!nickname) return null;

  const downloadUrl = `https://api.fasberry.su/minecraft/skin/download-skin/${nickname}`

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-neutral-50 items-center justify-center flex w-full h-[46px]">
          <Typography textSize="medium" className="font-semibold text-neutral-900">
            Скачать скин
          </Typography>
        </Button>
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
            <Typography className="text-shark-950 text-base font-medium">
              Скачать
            </Typography>
          </a>
          <DialogClose>
            <Button>
              Отмена
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinDownloadLink")