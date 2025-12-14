import { HOST, PORT } from '@/shared/env';
import { Hono } from 'hono'
import { apply, serve } from '@photonjs/hono'

function startServer() {
  const app = new Hono()

  apply(app)

  if (typeof Bun !== "undefined") {
    console.log("Bun runtime")
  } else {
    console.log("Node runtime")
  }

  const appConfig: Parameters<typeof serve>[1] = {
    port: Number(PORT),
    hostname: HOST
  }

  return serve(app, appConfig)
}

export default startServer()
