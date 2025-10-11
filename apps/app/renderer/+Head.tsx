export default function HeadDefault() {
  return (
    <>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="Fasberry" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="preconnect" href="https://api.fasberry.su"/>
      <link rel="preconnect" href="https://volume.fasberry.su" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <meta name="keywords" content="fasberry, minecraft, фасберри, фесберри, фесберри проект, майнкрафт сервер,
      майнкрафт, майнкрафт играть, minecraft play, сервера майнкрафт бесплатно, список серверов майнкрафта,
      полу-ванильные сервера майнкрафта, полуванила майнкрафт, rp сервер майнкрафт, rpg сервер майнкрафт,
      rp rpg сервер майнкрафт, город в майнкрафте сервер, minecraft server, выживание, survival minecraft,
      survival, smp, fasberry project, minecraft fasberry, minecraft server play"/>
      <meta name="author" content="Fasberry Project Team" />
      <meta name="format-detection" content="email=yes, address=yes, telephone=yes" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Fasberry Project" />
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap"
        onLoad={e => {
          e.currentTarget.rel = 'stylesheet';
        }}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap"
        />
      </noscript>
    </>
  );
}
