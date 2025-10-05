import { Ctx } from "@reatom/core";
import { PageContext } from "vike/types";
import { isProduction } from "../env";
import { snapshotAtom } from "./ssr";

export function mergeSnapshot(reatomCtx: Ctx, pageContext: PageContext) {
  const prevSnap = pageContext.snapshot;
  !isProduction && console.log(prevSnap)
  
  const updatedSnap = reatomCtx.get(snapshotAtom)
  !isProduction && console.log(updatedSnap)

  const newSnap = { ...prevSnap, ...updatedSnap }
  !isProduction && console.log(newSnap)
  return newSnap
}