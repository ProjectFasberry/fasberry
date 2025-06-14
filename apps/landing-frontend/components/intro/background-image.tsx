"use client"

import { FORUM_SHARED_API } from "@repo/shared/constants/api";
import { useQuery } from "@tanstack/react-query"

async function getIntroBackgroundImage() {
  const res = await FORUM_SHARED_API(`get-static-image`, {
    searchParams: {
      bucket: "user_images",
      fileName: "default/rain-weather.jpg"
    }
  })

  const data = await res.json<{ data: string } | { error: string }>()

  if ("error" in data) {
    return null;
  }

  return data.data;
}

const introBackgroundImageQuery = () => useQuery({
  queryKey: ["ui", "intro-background-image"],
  queryFn: () => getIntroBackgroundImage(),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false
})

export const IntroBackgroundImage = () => {
  const { data: url } = introBackgroundImageQuery()

  if (!url) return null

  return (
    <div
      className="w-full h-full absolute top-0 right-0 brightness-[55%] left-0 bg-no-repeat bg-center bg-cover"
      style={{ backgroundImage: `url(${url})` }}
    />
  )
}