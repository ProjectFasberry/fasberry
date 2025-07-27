import { getStaticImage } from "@/shared/lib/volume-helpers"
import { clientOnly } from "vike-react/clientOnly"

const ToasterInit = clientOnly(() => import("sonner").then(m => m.Toaster))

const icons = {
  info: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={getStaticImage("icons/challenges_icon.png")} />,
  error: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={getStaticImage("icons/challenges_icon.png")} />,
  success: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={getStaticImage("icons/challenges_icon.png")}/>,
  warning: <img width={32} height={32} alt="" loading="lazy" draggable={false} src={getStaticImage("icons/challenges_icon.png")} />
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