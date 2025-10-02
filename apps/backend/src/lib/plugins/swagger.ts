import swagger, { ElysiaSwaggerConfig } from "@elysiajs/swagger"
import Elysia from "elysia"

const swaggerConfig: ElysiaSwaggerConfig = {
  scalarConfig: {
    spec: {
      url: '/minecraft/swagger/json'
    }
  }
}

export const swaggerPlugin = () => new Elysia().use(
  swagger(swaggerConfig)
)