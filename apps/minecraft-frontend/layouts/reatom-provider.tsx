import { createCtx } from '@reatom/core'
import { connectLogger } from '@reatom/framework'
import { reatomContext } from '@reatom/npm-react'
import { PropsWithChildren } from 'react'

const ctx = createCtx()

if (import.meta.env.DEV) {
  connectLogger(ctx)
}

export const ReatomProvider = ({ children }: PropsWithChildren) => {
  return (
    <reatomContext.Provider value={ctx}>
      {children}
    </reatomContext.Provider>
  )
}
