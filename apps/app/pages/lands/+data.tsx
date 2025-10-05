import { PageContextServer } from "vike/types";
import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from "@/shared/lib/wrap-title";
import { logRouting } from "@/shared/lib/log";

function metadata() {
  return {
    title: wrapTitle("Территории"),
    description: "Территории сервера",
  }
}

export async function data(pageContext: PageContextServer) {
  const config = useConfig()

  logRouting(pageContext.urlPathname, "data");

  config(metadata())
}