import type { OnPageTransitionEndAsync } from "vike/types";
import { BProgress } from '@bprogress/core';

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  document.querySelector("body")?.classList.remove("page-is-transitioning");
  BProgress.done()
};
