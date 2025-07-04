import { z } from "zod/v4";

export const donateSchema = z.enum(['authentic', 'arkhont', 'loyal']);