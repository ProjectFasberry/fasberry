import Elysia from 'elysia'
import { HttpStatusEnum } from 'elysia-http-status-code/status'
import { rateLimit } from 'elysia-rate-limit'

export class RateLimitError extends Error {
  constructor(
    public message: string = 'rate-limited',
    public detail: string = '',
    public status: number = HttpStatusEnum.HTTP_429_TOO_MANY_REQUESTS
  ) {
    super(message)
  }
}

const LIMIT_PER_MINUTE = 300

export const ratelimit = () => new Elysia()
  .use(rateLimit({ errorResponse: new RateLimitError(), max: LIMIT_PER_MINUTE }))