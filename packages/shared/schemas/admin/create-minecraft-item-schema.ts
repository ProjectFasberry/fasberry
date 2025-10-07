import { z } from "zod";

export const createMinecraftItemSchema = z.object({
  file: z.custom<File>(),
  meta: z.object({
    name: z.string(),
    description: z.string().nullable(),
  }),
})