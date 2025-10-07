import { Button } from "@repo/ui/button"
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography"
import { usePageContext } from "vike-react/usePageContext"
import { getStaticImage } from "@/shared/lib/volume-helpers";

const TITLE = {
  "player": "Игрок не найден",
  "land": "Похоже этого региона уже нет",
  "store-item": "Товар не найден"
} as const;

const allayImage = getStaticImage("gifs/allay.gif")

export default function Page() {
  const type = usePageContext().urlParsed.search["type"] as keyof typeof TITLE | undefined

  return (
    <MainWrapperPage>
      <div className="flex flex-col items-center h-[80vh] justify-center gap-4 w-full">
        <img src={allayImage} height={102} width={102} alt="Allay" />
        <Typography className="font-semibold text-xl">
          {type ? TITLE[type] : "Ресурс не найден"}
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <Button
            className='bg-neutral-50 w-fit'
            onClick={() => window.history.back()}
          >
            <Typography color="black" className="font-semibold px-6">
              Вернуться
            </Typography>
          </Button>
        </div>
      </div>
    </MainWrapperPage>
  )
}