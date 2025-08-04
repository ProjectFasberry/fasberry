import { getStaticObject } from "@/shared/lib/volume";

export default function HeadIndex() {
  return (
    <>
      <meta name="description" content="Ознакомьтесь с правилами нашего Fasberry-сервера, чтобы обеспечить честную и дружелюбную игру для всех участников. Уважайте других игроков и следуйте установленным нормам поведения." />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      <meta property="og:title" content="Правила Fasberry" />
      <meta property="og:description" content="Правила нашего Fasberry-сервера для комфортной игры. Соблюдайте установленные нормы и поддерживайте дружелюбную атмосферу!" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Правила Fasberry" />
      <meta property="og:image" content={getStaticObject("background", "main_background.png")} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:title" content="Правила Fasberry" />
      <meta name="twitter:description" content="Правила нашего Fasberry-сервера для комфортной игры. Соблюдайте установленные нормы и поддерживайте дружелюбную атмосферу!" />
      <meta name="twitter:image" content={getStaticObject("background", "main_background.png")} />
      <meta property="twitter:image:type" content="image/jpeg" />
      <meta property="twitter:image:width" content="1200" />
      <meta property="twitter:image:height" content="630" />
    </>
  )
}