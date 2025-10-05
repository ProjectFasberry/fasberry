import { Typography } from "@repo/ui/typography"
import { Dialog, DialogContent, DialogTrigger } from "@repo/ui/dialog"
import { Button } from "@repo/ui/button"
import { getStaticImage } from "@/shared/lib/volume-helpers"

const EventsNotFound = () => {
  const eventImage = getStaticImage("arts/looking.jpg")

  return (
    <div className="flex w-full items-center justify-center h-full gap-12 px-12 py-6 relative">
      <div className="flex flex-col items-center gap-y-4">
        <img src={eventImage} alt="" width={256} height={256} />
        <Typography className="text-xl font-bold text-shark-50">
          Ивентов пока нет
        </Typography>
      </div>
    </div>
  )
}

const Charism = ({ amount }: { amount: number }) => {
  const charismImage = getStaticImage("charism_wallet.png")

  return (
    <div className="flex items-center gap-1">
      <img src={charismImage} alt="" width={32} height={32} />
      <Typography className="text-base">
        {amount}
      </Typography>
    </div>
  )
}

const ExampleEvent = () => {
  const exampleImage = getStaticImage("arts/fishing_rod.webp");
  
  return (
    <div className="flex flex-col items-center 2xl:aspect-square gap-4 w-full rounded-md p-2 bg-shark-950">
      <div className="border border-shark-700 w-full flex items-center justify-center rounded-md p-4">
        <img src={exampleImage} alt="" width={96} height={96} />
      </div>
      <div className="flex flex-col justify-start w-full">
        <Typography className="font-semibold text-lg">
          Проголосовать за сервер
        </Typography>
        <Typography color="gray">
          Отдайте голос самому лучшему серверу!
        </Typography>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2 gap-2 lg:justify-end w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-fit">
              <Typography className="text-base">
                Награда
              </Typography>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-y-4 items-center justify-center w-full">
              <Typography className="text-xl font-semibold" color='white'>
                Ивент: Проголосовать за сервер
              </Typography>
              <div className="flex flex-col gap-2 p-2 w-full">
                <Typography className="text-base">
                  Награда:
                </Typography>
                <Charism amount={25} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <a href="https://hotmc.ru/minecraft-server-259308" target="_blank" rel="noreferrer">
          <Button className="w-full lg:w-fit bg-green" >
            <Typography className="text-base">
              Отдать голос
            </Typography>
          </Button>
        </a>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex lg:flex-row flex-col w-full min-h-dvh gap-2">
      <div className="flex flex-col gap-y-4 w-full !p-4">
        <Typography color="white" className="text-2xl font-semibold">
          Задания
        </Typography>
        <div className="flex flex-col gap-2 w-full h-full">
          <Typography className="text-xl">
            Системные
          </Typography>
          <div className="grid lg:grid-cols-3 2xl:grid-cols-5 auto-rows-auto gap-4 w-full">
            <ExampleEvent />
          </div>
        </div>
      </div>
    </div>
  )
}