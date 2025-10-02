import { BProgress } from '@bprogress/core';
import { PageContextClient } from 'vike/types';

export const onPageTransitionEnd = async (pageContext: PageContextClient) => {
  BProgress.done()
};