import { Ctx } from "@reatom/core";
import { PageContext } from "vike/types";
import { isDevelopment } from "../env";
import { snapshotAtom } from "./ssr";

export function mergeSnapshot(reatomCtx: Ctx, pageContext: PageContext) {
  const prevSnap = pageContext.snapshot;
  const updatedSnap = reatomCtx.get(snapshotAtom)
  const newSnap = { ...prevSnap, ...updatedSnap }
  
  if (isDevelopment) {
    console.log(prevSnap)
    console.log(updatedSnap)
    console.log(newSnap)
  }

  return newSnap
}