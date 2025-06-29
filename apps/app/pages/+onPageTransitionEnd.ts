import { BProgress } from '@bprogress/core';
import type { OnPageTransitionEndAsync } from "vike/types";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  document.querySelector("body")?.classList.remove("page-is-transitioning");
  BProgress.done()
};