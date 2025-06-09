import { PlayerStatusProps } from "../status/player-status";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@repo/landing-ui/src/skeleton";
import { getSkinDetails } from "#components/header/avatar/queries/avatar-query";

type PlayerStatusImageProps = {
	type?: "small" | "full"
} & PlayerStatusProps

const playerAvatarQuery = (nickname: string) => useQuery({
	queryKey: ['player-avatar', nickname],
	queryFn: () => getSkinDetails({ type: "head", nickname }),
	refetchOnWindowFocus: false
})

export const PlayerStatusImage = ({
	nickname, type = "small"
}: PlayerStatusImageProps) => {
	const { data: avatarUrl, isLoading } = playerAvatarQuery(nickname)

	if (isLoading) {
		return <Skeleton className={`rounded-md border-neutral-600 ${type === 'small'
				? 'max-w-[36px] max-h-[36px]'
				: 'max-w-[164px] max-h-[164px]'}`
			}
		/>
	}

	return (
		<img
			height={800}
			width={800}
			className={`rounded-md border-neutral-600 ${type === 'small'
				? 'max-w-[36px] max-h-[36px]'
				: 'max-w-[164px] max-h-[164px]'}`
			}
			alt=""
			src={avatarUrl}
		/>
	)
}