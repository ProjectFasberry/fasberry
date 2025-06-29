import { useData } from "vike-react/useData";
import { Data } from "./+data";
import logoUrl from "@repo/assets/images/minecraft_project_logotype_bg.png";

export default function HeadPlayer() {
  const data = useData<Data>()

  return (
    <>
      <meta name="description" content={`Minecraft page ${data.id}`} />
      <meta property="og:description" content={`Minecraft page ${data.id}`} />
      <meta property="og:image" content={logoUrl}/>
      <meta name="keywords" content={`${data.id}, ${data.title}, fasberry, fasberry page, профиль ${data.id}`}/>
    </>
  );
}
