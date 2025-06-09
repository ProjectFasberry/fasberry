import { PageContext } from "vike/types";
import { Data } from "./+data";
import { wrapTitle } from "@/lib/wrap-title";

export default (pageContext: PageContext<Data>) => wrapTitle(pageContext.data.id)