import { Rec } from "@reatom/core";
import { PersistRecord } from "@reatom/persist";
import { Locale } from "./shared/locales";

declare global {
  namespace Vike {
    interface PageContext {
      snapshot: Rec<PersistRecord<unknown>>,
      Page: () => React.JSX.Element,
      locale: Locale,
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
