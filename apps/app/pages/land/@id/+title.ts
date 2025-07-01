import { PageContext } from "vike/types";
import { Data } from "./+data";
import { wrapTitle } from "@/shared/lib/wrap-title";

export default (pageContext: PageContext<Data>) => 
  wrapTitle(pageContext.data?.land?.name 
    ? `Территория ${pageContext.data.land.name}` : "Территирия не найдена"
  )