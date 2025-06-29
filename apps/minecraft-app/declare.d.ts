import { Rec } from "@reatom/core"
import { PersistRecord } from "@reatom/persist"

declare module "*.jpg"

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

  interface CurrentUser {
    nickname: string
    uuid: string
    issued_time: string | Date,
    reg_date: string | Date
  }
}

export { }