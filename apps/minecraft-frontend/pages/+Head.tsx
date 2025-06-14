// https://vike.dev/Head

import logoUrl from "@repo/assets/images/minecraft_project_logotype_bg.png";

export default function HeadDefault() {
  return (
    <>
      <link rel="icon" href={logoUrl} />
      <meta name="description" content="Minecraft Fasberry Project.Init description" />
      <meta property="og:description" content="Minecraft Fasberry Project.Init description" />
    </>
  );
}
