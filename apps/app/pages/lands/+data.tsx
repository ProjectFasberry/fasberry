import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  config({
    title: wrapTitle("Территории"),
    description: "Территории сервера",
  })
}