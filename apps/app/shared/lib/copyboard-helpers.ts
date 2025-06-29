export const actionCopyboard = async (ip: string) => {
  await navigator.clipboard.writeText(ip);
  return
}