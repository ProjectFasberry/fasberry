import { clientOnly } from "vike-react/clientOnly"

const ToasterInit = clientOnly(() => import("sonner").then(m => m.Toaster))

const icons = {
  info: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
  error: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
  success: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
  warning: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />
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