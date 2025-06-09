import { ConfirmationButton } from "#components/modals/confirmation-modal/components/confirmation-action-button";
import { ConfirmationActionModalTemplate } from "#components/modals/confirmation-modal/components/confirmation-action-modal";
import { requestedUserParamAtom } from "#components/profile/main/models/requested-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { skinClient } from "@repo/shared/api/minecraft-client";
import { Button } from "@repo/ui/src/components/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@repo/ui/src/components/dialog";
import { Typography } from "@repo/ui/src/components/typography";
import { ArrowDownFromLine } from "lucide-react";
import { useState } from "react";

export const ProfileSkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(requestedUserParamAtom)
  if (!nickname) return null;

  const downloadUrl = skinClient.skin["download-skin"][":nickname"].$url({ param: { nickname } });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center gap-2 w-full">
          <Button variant="positive" className="w-full h-[46px]">
            <Typography textSize="medium" className="text-shark-50">
              Скачать скин
            </Typography>
          </Button>
          <Button variant="positive" className="h-[46px] w-[46px]">
            <ArrowDownFromLine size={20} />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <ConfirmationActionModalTemplate title="Скачать скин?">
          <a
            href={downloadUrl.href}
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
            <ConfirmationButton actionType="cancel" title="Отмена" />
          </DialogClose>
        </ConfirmationActionModalTemplate>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinDownloadLink")