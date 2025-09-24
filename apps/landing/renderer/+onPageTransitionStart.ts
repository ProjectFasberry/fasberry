import { BProgress } from '@bprogress/core';
import { PageContextClient } from 'vike/types';

export const onPageTransitionStart = async (_: Partial<PageContextClient>) => {
  document.querySelector("body")?.classList.add("page-is-transitioning");
  BProgress.start()
};
