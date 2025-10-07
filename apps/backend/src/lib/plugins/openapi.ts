import Elysia from "elysia"
import z from "zod";
import { ElysiaOpenAPIConfig, fromTypes, openapi } from "@elysiajs/openapi"
import { isProduction } from "#/shared/env";

const swaggerConfig: ElysiaOpenAPIConfig = {
  scalar: {
    spec: {
      url: '/minecraft/openapi/json'
    }
  },
  references: fromTypes(isProduction ? 'dist/index.d.ts' : 'src/index.ts'),
  mapJsonSchema: {
    zod: z.toJSONSchema
  }
}

export const openApiPlugin = () => new Elysia().use(
  openapi(swaggerConfig)
)