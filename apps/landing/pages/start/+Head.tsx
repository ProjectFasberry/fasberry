import { getStaticObject } from "@/shared/lib/volume";

export default function HeadIndex() {
  return (
    <>
      <meta name="description" content="Начать играть на Fasberry сервере." />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      <meta property="og:title" content="Начать играть на Fasberry" />
      <meta property="og:description" content="Присоединяйтесь к сообществу Fasberry и помогайте нам развиваться! Ваша поддержка имеет значение." />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Начать играть на Fasberry" />
      <meta property="og:image" content={getStaticObject("background", "rules_background.png")}/>
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:title" content="Начать играть на Fasberry" />
      <meta name="twitter:description" content="Присоединяйтесь к сообществу Fasberry и помогайте нам развиваться! Ваша поддержка имеет значение." />
      <meta name="twitter:image" content={getStaticObject("background", "rules_background.png")} />
      <meta property="twitter:image:type" content="image/jpeg" />
      <meta property="twitter:image:width" content="1200" />
      <meta property="twitter:image:height" content="630" />
    </>
  )
}