import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Typography } from '@repo/ui/typography';
import { Button } from '@repo/ui/button';
import { LANDING_ENDPOINT } from '@/shared/env';

export const SkinHowToChange = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-neutral-50 w-full h-12">
          <Typography className="text-lg font-semibold text-neutral-950">
            Как изменить скин?
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Как изменить скин?</DialogTitle>
        <div className="flex flex-col gap-4 w-full items-center justify-center">
          <div className="flex flex-col gap-y-2 p-2 w-full">
            <Typography className="text-md">
              Чтобы изменить скин вам нужно зайти на сервер и ввести команду:
            </Typography>
            <Typography className="text-md">
              <pre className="bg-shark-900 px-2 py-1 rounded-lg w-fit">
                <code>/skin set [никнейм]</code>
              </pre>
            </Typography>
          </div>
          <div className="flex items-center w-full p-2">
            <a href={`${LANDING_ENDPOINT}/wiki?tab=skin`} target="_blank">
              <Typography className="text-md">
                Больше о формировании скина
              </Typography>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}