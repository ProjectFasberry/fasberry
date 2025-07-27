import { getStaticImage } from "../lib/volume-helpers"

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-[80vh]">
      <img src={getStaticImage("gifs/loading.webp")} width={96} height={96} alt="Загрузка..." />
    </div>
  )
}
