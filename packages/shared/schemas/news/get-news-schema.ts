import { z } from "zod";

export const getNewsSchema = z.object({
  limit: z.string().transform(Number).optional(),
  cursor: z.string().optional(),
  ascending: z.string().transform((val) => val === "true").optional(),
  searchQuery: z.string().optional(),
})