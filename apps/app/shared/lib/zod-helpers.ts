import { ZodError } from "zod";

export function parseZodErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => issue.message);
}