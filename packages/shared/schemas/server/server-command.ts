import { z } from 'zod/v4';

export const callServerCommandSchema = z.object({
  parent: z.enum(["lp", "sudo", "cmi"]),
  value: z.string()
})