import { createMemStorage, reatomPersist } from '@reatom/persist'

export const ssrStorage = createMemStorage({ 
  name: 'ssr', 
  subscribe: true 
})

export const { snapshotAtom } = ssrStorage;

export const withSsr = reatomPersist(ssrStorage)