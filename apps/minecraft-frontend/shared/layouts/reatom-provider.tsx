import { isSsr } from '@/shared/lib/is-ssr'
import { connectLogger } from '@reatom/framework'
import { reatomContext, useCreateCtx, useUpdate } from '@reatom/npm-react'
import { PropsWithChildren } from 'react'

const StartLogger = () => useUpdate((ctx) => (isSsr() && import.meta.env.DEV) ? connectLogger(ctx) : undefined, [])

export const ReatomProvider = ({ children }: PropsWithChildren) => {
  const ctx = useCreateCtx()

  return (
    <reatomContext.Provider value={ctx}>
      <StartLogger />
      {children}
    </reatomContext.Provider>
  )
}