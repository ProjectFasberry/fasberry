import { Dialog } from "@ark-ui/react";
import { reatomComponent } from "@reatom/npm-react";
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";

export const ProfileSkinHowToChange = reatomComponent(({ ctx }) => {
  const isOwner = true
  if (!isOwner) return null;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn bg-shark-50 w-full h-[46px]">
          <p className="text-md text-shark-950">
            Как изменить скин?
          </p>
        </button>
      </Dialog.Trigger>
      <Dialog.Content>
        <div className="flex flex-col gap-y-4 w-full items-center justify-center">
          <p variant="dialogTitle">
            Как изменить скин?
          </p>
          <div className="flex flex-col gap-y-2 p-2 w-full">
            <p className="text-md">
              Чтобы изменить скин вам нужно зайти на сервер и ввести команду:
            </p>
            <p className="text-md">
              <pre className="bg-shark-900 px-2 py-1 rounded-lg w-fit">
                <code>/skin set [никнейм]</code>
              </pre>
            </p>
          </div>
          <div className="flex items-center w-full p-2">
            <a href={`${MINECRAFT_SITE_DOMAIN}/wiki?tab=skin`} rel="noreferrer" target="_blank">
              <button state="default" className="btn">
                <p className="text-md">
                  Больше о формировании скина
                </p>
              </button>
            </a>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}, "ProfileSkinHowToChange")