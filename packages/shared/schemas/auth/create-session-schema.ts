import { z } from 'zod';

export const tokenSchema = process.env.NODE_ENV === 'production' ? z.string() : z.nullable(z.string())

export const nicknameSchema = z
  .string()
  .min(1, { error: "Поле обязательно для заполнения!" })
  .max(16, { error: "Ник не содержит больше 16 символов!" })
  .regex(/^[^\u0400-\u04FF]*$/, { error: "Ник содержит недопустимые символы" })
  .regex(/^\S*$/, {
    error: "Ник не должен содержать пробельные символы (пробелы, табы и т.д.)",
  });

export const passwordSchema = z
  .string()
  .min(4, { error: "Пароль не должен содержать менее 4 символов" })
  .max(32, { error: "Пароль не должен превышать 32 символа" })
  .regex(/^\S*$/, {
    error: "Пароль не должен содержать пробельные символы (пробелы, табы и т.д.)",
  });

export const findoutSchema = z
  .string()
  .min(2, { error: "Опишите причину подробнее, пожалуйста", })
  .max(128)

export const referrerSchema = z.nullable(z.string())

export const createSessionBodySchema = z.object({
  nickname: z.string(),
  password: z.string().min(4),
  token: tokenSchema
});

export const registerSchema = z.object({
  nickname: nicknameSchema,
  password: passwordSchema,
  token: tokenSchema,
  findout: findoutSchema,
  referrer: referrerSchema
})