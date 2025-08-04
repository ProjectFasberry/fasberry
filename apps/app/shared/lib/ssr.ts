import { createMemStorage, reatomPersist } from '@reatom/persist'
import { pageContextAtom } from '../models/global.model';

export const ssrStorage = createMemStorage({ 
  name: 'ssr', 
  subscribe: true 
})

export const { snapshotAtom } = ssrStorage;

export const withSsr = reatomPersist(ssrStorage)

pageContextAtom.onChange((ctx, state) => {
  if (!state) return;
  snapshotAtom(ctx, state.snapshot)
})