import { useSuspenseQuery } from '@tanstack/react-query';
import { MINECRAFT_API } from "@repo/shared/constants/api"

export const USER_AVATAR_QUERY_KEY = (nickname: string) => ['ui', 'avatar', nickname];

type GetSkinDetails = {
  type: "head" | "skin"
  nickname: string
}

export async function getSkinDetails({ type, nickname }: GetSkinDetails) {
  const blob = await MINECRAFT_API(`skin/get-${type}/${nickname}`).blob()

  return URL.createObjectURL(blob)
}

export const userAvatarQuery = (nickname: string) => useSuspenseQuery({
  queryKey: USER_AVATAR_QUERY_KEY(nickname),
  queryFn: () => getSkinDetails({ type: 'head', nickname }),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  gcTime: Infinity,
  staleTime: Infinity,
});