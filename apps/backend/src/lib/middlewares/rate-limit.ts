import { HttpStatusEnum } from 'elysia-http-status-code/status'

export class RateLimitError extends Error {
  constructor(
    public message: string = 'rate-limited',
    public detail: string = '',
    public status: number = HttpStatusEnum.HTTP_429_TOO_MANY_REQUESTS
  ) {
    super(message)
  }
}