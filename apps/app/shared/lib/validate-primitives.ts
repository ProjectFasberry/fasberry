export function validateNumber(input: string): number | null {
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
};

export function parseBoolean(str: string | undefined | null): boolean {
  return String(str).toLowerCase() === "true";
}