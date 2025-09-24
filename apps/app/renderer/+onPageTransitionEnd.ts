import { BProgress } from '@bprogress/core';
import type { OnPageTransitionEndAsync } from "vike/types";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  BProgress.done()
};