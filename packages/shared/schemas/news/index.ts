import { z } from "zod";
import { JsonValue } from "../../types/db/auth-database-types";

export const getNewsSchema = z.object({
  limit: z.string().transform(Number).optional(),
  cursor: z.string().optional(),
  ascending: z.string().transform((val) => val === "true").optional(),
  searchQuery: z.string().optional(),
})

const DEFAULT_IMAGE = `/news/art-bzzvanet.webp`

export const createNewsSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().trim().nullable().optional().transform((v) => v?.trim() || DEFAULT_IMAGE),
  content: z.object({}).loose().transform((v) => v as JsonValue)
})