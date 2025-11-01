import { withSsr } from "@/shared/lib/ssr";
import { atom } from "@reatom/core";
import { CartPayload } from "@repo/shared/types/entities/store";

export const cartDataAtom = atom<CartPayload["products"]>([], "cartData").pipe(withSsr("cartData"))
