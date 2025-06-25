import type { OnPageTransitionStartAsync } from "vike/types";
import { BProgress } from '@bprogress/core';

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  document.querySelector("body")?.classList.add("page-is-transitioning");
  BProgress.start()
};
