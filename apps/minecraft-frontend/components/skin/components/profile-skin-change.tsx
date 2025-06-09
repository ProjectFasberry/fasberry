import { requestedUserIsSameAtom } from "#components/profile/main/models/requested-user.model";
import { reatomComponent } from "@reatom/npm-react";
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";
import { Button } from "@repo/ui/src/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/src/components/dialog";
import { Typography } from "@repo/ui/src/components/typography";

export const ProfileSkinHowToChange = reatomComponent(({ ctx }) => {
  const isOwner = ctx.spy(requestedUserIsSameAtom)
  if (!isOwner) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-shark-50 w-full h-[46px]">
          <Typography textSize="medium" className="text-shark-950">
            Как изменить скин?
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-y-4 w-full items-center justify-center">
          <Typography variant="dialogTitle">
            Как изменить скин?
          </Typography>
          <div className="flex flex-col gap-y-2 p-2 w-full">
            <Typography textSize="medium">
              Чтобы изменить скин вам нужно зайти на сервер и ввести команду:
            </Typography>
            <Typography textSize="medium">
              <pre className="bg-shark-900 px-2 py-1 rounded-lg w-fit">
                <code>/skin set [никнейм]</code>
              </pre>
            </Typography>
          </div>
          <div className="flex items-center w-full p-2">
            <a href={`${MINECRAFT_SITE_DOMAIN}/wiki?tab=skin`} rel="noreferrer" target="_blank">
              <Button state="default">
                <Typography textSize="medium">
                  Больше о формировании скина
                </Typography>
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ProfileSkinHowToChange")