import { GuardAsync, PageContext } from "vike/types";
import { validateRequest } from "@/shared/api/validators";

export const guard: GuardAsync = async (pageContext) => {
  await validateRequest(pageContext)
}