import { Rec } from "@reatom/core"
import { PersistRecord } from "@reatom/persist"

declare global {
  namespace Vike {
    interface GlobalContext {
      Page: () => React.JSX.Element
    }
    
    interface PageContext {
      snapshot: Rec<PersistRecord<unknown>>,
      Page: () => React.JSX.Element
    }
  }
}

export { }