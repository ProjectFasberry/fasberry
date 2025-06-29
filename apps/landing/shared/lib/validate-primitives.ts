export function validateNumber(input: string): number | null {
  const num = Number(input);
  return Number.isFinite(num) ? num : null;
};