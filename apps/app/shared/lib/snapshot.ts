import { Ctx } from "@reatom/core";
import { PageContext } from "vike/types";
import { snapshotAtom } from "./ssr";
import { devLog } from "./log";

export function mergeSnapshot(reatomCtx: Ctx, pageContext: PageContext) {
  const prevSnap = pageContext.snapshot;
  const updatedSnap = reatomCtx.get(snapshotAtom)
  const newSnap = { ...prevSnap, ...updatedSnap }
  
  devLog(prevSnap)
  devLog(updatedSnap)
  devLog(newSnap)

  return newSnap
}