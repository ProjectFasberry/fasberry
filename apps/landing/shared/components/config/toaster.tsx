import { getStaticObject } from "@/shared/lib/volume"
import { clientOnly } from "vike-react/clientOnly"

const ToasterInit = clientOnly(() => import("sonner").then(m => m.Toaster))

const img = getStaticObject("minecraft/icons", "book_big.webp")

const icons = {
  info: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={img} />,
  error: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={img}/>,
  success: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={img} />,
  warning: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={img} />
}

export const Toaster = () => {
  return (
    <ToasterInit
      position="top-left"
      richColors
      icons={icons}
    />
  )
}