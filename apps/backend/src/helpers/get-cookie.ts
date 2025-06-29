export function getCookie(cookieHeader: string, name: string): string | null {
  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1] ?? null
}
