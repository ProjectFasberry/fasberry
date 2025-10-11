import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getOrder } from "./order.model";

export const orderRoute = new Elysia()
  .get("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await getOrder(id)
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })