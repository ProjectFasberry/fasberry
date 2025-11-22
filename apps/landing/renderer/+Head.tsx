import { getStaticObject } from "@/shared/lib/volume";

const bgImage = getStaticObject("backgrounds", "donate_background.png")

export default function HeadDefault() {
  return (
    <>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="Fasberry" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="description" content="Minecraft Fasberry Project.Init description" />
      <meta property="og:description" content="Minecraft Fasberry Project.Init description" />
      <meta name="keywords" content="fasberry, minecraft, фасберри, фесберри, фесберри проект, майнкрафт сервер,
        майнкрафт, майнкрафт играть, minecraft play, сервера майнкрафт бесплатно, список серверов майнкрафта,
        полу-ванильные сервера майнкрафта, полуванила майнкрафт, rp сервер майнкрафт, rpg сервер майнкрафт,
        rp rpg сервер майнкрафт, город в майнкрафте сервер, minecraft server, выживание, survival minecraft,
        survival, smp, fasberry project, minecraft fasberry, minecraft server play"/>
      <meta name="author" content="Fasberry Project Team" />
      <meta name="format-detection" content="email=yes, address=yes, telephone=yes" />
      <meta name="description" content="Официальная страница майнкрафт-проекта Fasberry. Жанр: RP, RPG, полу-ванила. 1.20.1+. Играть: play.fasberry.su." />
      <meta name="robots" content="index, follow, noarchive" />
      <meta name="googlebot" content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      <meta name="keywords" content="fasberry, minecraft, фасберри, фесберри, фесберри проект, майнкрафт сервер,
        майнкрафт, майнкрафт играть, minecraft play, сервера майнкрафт бесплатно, список серверов майнкрафта,
        полу-ванильные сервера майнкрафта, полуванила майнкрафт, rp сервер майнкрафт, rpg сервер майнкрафт,
        rp rpg сервер майнкрафт, город в майнкрафте сервер, minecraft server, выживание, survival minecraft,
        survival, smp, fasberry project, minecraft fasberry, minecraft server play"/>
      <meta name="author" content="Fasberry Project Team" />
      <meta name="format-detection" content="email=yes, address=yes, telephone=yes" />
      <meta property="og:title" content="Fasberry Project" />
      <meta property="og:description" content="Сколько хороших и комфортных для вас майнкрафт-серверов вы знаете/знали? Теперь знаете на один больше." />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Официальный сайт майнкрафт сервера Fasberry." />
      <meta property="og:image" content={bgImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:title" content="Fasberry Project" />
      <meta name="twitter:description" content="Сколько хороших и комфортных для вас майнкрафт-серверов вы знаете/знали? Теперь знаете на один больше." />
      <meta name="twitter:image" content={bgImage} />
      <meta property="twitter:image:type" content="image/jpeg" />
      <meta property="twitter:image:width" content="1200" />
      <meta property="twitter:image:height" content="630" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow, noimageindex, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      <link rel="preconnect" href="https://api.fasberry.su" crossOrigin="" />
      <link rel="preconnect" href="https://volume.fasberry.su" crossOrigin="" />
      <link
        rel="preload"
        as="font"
        type="font/ttf"
        href="/fonts/minecraft.ttf"
        crossOrigin=""
      />
    </>
  );
}
