import Loading from "@repo/assets/gifs/loading.webp"

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <img src={Loading} width={96} height={96} alt="Загрузка..." />
    </div>
  )
}