import { BProgress } from '@bprogress/core';
import { PageContextClient } from 'vike/types';

export const onPageTransitionStart = async (pageContext: Partial<PageContextClient>) => {
  BProgress.start()
};