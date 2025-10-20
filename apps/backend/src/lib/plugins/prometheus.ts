import Elysia from "elysia";
import plugin from 'elysia-prometheus'

export const prometheusPlugin = () => new Elysia()
  .use(
    plugin({
      metricsPath: '/metrics',
      staticLabels: {
        service: 'backend'
      },
      dynamicLabels: {
        userAgent: (ctx) => ctx.request.headers.get('user-agent') ?? 'unknown'
      }
    })
  )