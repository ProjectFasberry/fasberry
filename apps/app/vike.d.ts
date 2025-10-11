import { Rec } from "@reatom/core"
import { PersistRecord } from "@reatom/persist"
import { Locale } from "./shared/locales"

declare global {
  namespace Vike {
    interface GlobalContext {
      Page: () => React.JSX.Element
    }
    
    interface PageContext {
      snapshot: Rec<PersistRecord<unknown>>,
      locale: Locale,
      Page: () => React.JSX.Element
    }
  }
}

export { }