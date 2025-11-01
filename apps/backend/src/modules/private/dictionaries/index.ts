import { validatePermission } from "#/lib/middlewares/validators";
import { PERMISSIONS } from "#/shared/constants/permissions";
import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import z from "zod";

const dictionariesList = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.READ))
  .get("/list", async (ctx) => {
    const data = await general
      .selectFrom("dictionaries")
      .selectAll()
      .execute()

    return { data }
  })

const dictionariesCreate = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.CREATE))
  .post("/create", async ({ body }) => {
    const { key, value } = body;

    const data = await general
      .insertInto("dictionaries")
      .values({
        key, value
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return { data }
  }, {
    body: z.object({
      key: z.enum(["title", "key"]),
      value: z.string()
    }),
  })

const dictionariesEdit = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.UPDATE))
  .post("/:id/edit", async ({ params, body }) => {
    const id = params.id;
    const { key, value } = body;

    const data = await general
      .updateTable("dictionaries")
      .set({
        [key]: value
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return { data }
  }, {
    body: z.object({
      key: z.enum(["title", "key"]),
      value: z.string()
    }),
    params: z.object({
      id: z.coerce.number()
    })
  })

const dictionariesDelete = new Elysia()
  .use(validatePermission(PERMISSIONS.DICTIONARIES.DELETE))
  .delete("/:id/remove", async ({ params }) => {
    const id = params.id;

    const data = await general
      .deleteFrom("dictionaries")
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    return { data: { id } }
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })

export const dictionaries = new Elysia()
  .group("/dictionaries", app => app
    .use(dictionariesList)
    .use(dictionariesCreate)
    .use(dictionariesEdit)
    .use(dictionariesDelete)
  )