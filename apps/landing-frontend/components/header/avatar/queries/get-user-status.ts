import { FORUM_API } from "@repo/shared/constants/api"

export async function getUserStatus(nickname: string) {
  const res = await FORUM_API(`user/get-user-game-status/${nickname}`)

  const data = await res.json<{ data: string } | { error: string }>()

  if (!data || "error" in data) {
    return null
  }

  return data.data
}