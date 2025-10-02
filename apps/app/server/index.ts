import { HOST, PORT } from '@/shared/env';
import { Hono } from 'hono'
import { apply } from 'vike-server/hono'
import { serve } from 'vike-server/hono/serve'

async function startServer() {
  const app = new Hono()

  apply(app)

  const appConfig: Parameters<typeof serve>[1] = {
    port: Number(PORT),
    hostname: HOST
  }

  return serve(app, appConfig)
}

startServer()

export {}