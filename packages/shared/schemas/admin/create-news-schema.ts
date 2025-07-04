import { z } from "zod/v4";

export const createNewsSchema = z.object({
  title: z.string().max(1024),
  description: z.string().max(1000),
  image: z.instanceof(Uint8Array).nullable(),
  media_links: z.array(z.string()).optional().catch(() => undefined),
  tags: z.array(z.string()).optional().catch(() => undefined),
})