import { BProgress } from '@bprogress/core';
import type { OnPageTransitionStartAsync } from "vike/types";

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  BProgress.start()
};