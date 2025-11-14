import { Rec } from "@reatom/core";
import { PersistRecord } from "@reatom/persist";

declare global {
  namespace Vike {
    interface PageContext {
      snapshot: Rec<PersistRecord<unknown>>,
      Page: () => React.JSX.Element
    }
  }

  type PaginatedMeta = {
    hasNextPage: false,
    hasPrevPage: false,
    endCursor?: string,
    startCursor?: string
  }
}

export { }
