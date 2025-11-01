import { z } from "zod"

export const authSchema = z.object({
  nickname: z.string()
    .min(2, { error: "Поле обязательно для заполнения!" })
    .max(16, { error: "Ник не содержит больше 16 символов!" })
    .regex(/^(?!.*[\u0400-\u04FF])\S*$/, { error: "Ник содержит недопустимые символы или пробелы" }),
  password: z.string().min(6),
  token: z.string().min(4)
})

export const registerSchema = z.intersection(
  authSchema,
  z.object({
    findout: z.string().min(1),
    findoutType: z.enum(["custom", "referrer"])
  })
)