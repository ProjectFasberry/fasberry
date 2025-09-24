import { BProgress } from '@bprogress/core';
import { PageContextClient } from 'vike/types';

export const onPageTransitionEnd = async (_: PageContextClient) => {
  document.querySelector("body")?.classList.remove("page-is-transitioning");
  BProgress.done()
};
