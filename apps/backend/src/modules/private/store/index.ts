import Elysia from "elysia";
import { storeItemCreate } from "./store-item-create.route";
import { storeItemDelete, storeItemEdit } from "./store-item-delete.route";
import { storeMethodsEdit, storeMethodsList } from "./store-methods.route";

export const storePrivate = new Elysia()
  .group("/store", app => app
    .group("/item", app => app
      .use(storeItemCreate)
      .use(storeItemDelete)
      .use(storeItemEdit)
    )
    .group("/methods", app => app
      .use(storeMethodsList)
      .use(storeMethodsEdit)
    )
  )