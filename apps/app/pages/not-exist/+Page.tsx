import { Button } from "@repo/ui/button"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography"
import { usePageContext } from "vike-react/usePageContext"
import Allay from "@repo/assets/gifs/allay.gif"

const TITLE: Record<string, string> = {
  "user": "Игрок не найден",
  "land": "Похоже этого региона уже нет",
}

export default function NotExist() {
  const type = usePageContext().urlParsed.search["type"] as "user" | "land"

  return (
    <MainWrapperPage>
      <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
        <img src={Allay} height={102} width={102} alt="" />
        <Typography className="font-semibold text-base sm:text-xl">
          {TITLE[type] ?? "Ресурс не найден"}
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => window.history.back()} className='bg-neutral-50 w-fit'>
            <Typography color="black" className="font-semibold px-6">
              Вернуться
            </Typography>
          </Button>
        </div>
      </div>
    </MainWrapperPage>
  )
}