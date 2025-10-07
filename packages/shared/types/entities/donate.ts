import { z } from "zod";
import { DONATE_GROUPS } from "../../constants/donate-aliases";

export const donateSchema = z.enum(["arkhont", "authentic", "loyal", "default", "dev", "helper", "moder"])

export type Donate = keyof typeof DONATE_GROUPS