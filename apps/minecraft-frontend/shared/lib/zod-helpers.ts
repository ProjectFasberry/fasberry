import { ZodError } from "zod/v4";

export function parseZodErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => issue.message);
}