import { Link } from "../../config/link";
import { Typography } from "@repo/ui/typography";
import { Skeleton } from "@repo/ui/skeleton";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';

export type PlayerStatusProps = {
	nickname: string
}

type PlayerStatusImageProps = {
	type?: "small" | "full"
} & PlayerStatusProps

export const PlayerStatusImage = ({
	nickname, type = "small"
}: PlayerStatusImageProps) => {
	const { avatarUrl, isLoading } = { avatarUrl: null, isLoading: false }

	if (isLoading) {
		return <Skeleton className={`rounded-md ${type === 'small'
				? 'max-w-[36px] max-h-[36px]'
				: 'max-w-[164px] max-h-[164px]'}`
			}
		/>
	}

	if (!avatarUrl) return null;

	return (
		<img
			height={800}
			width={800}
			className={`rounded-md ${type === 'small'
				? 'max-w-[36px] max-h-[36px]'
				: 'max-w-[164px] max-h-[164px]'}`
			}
			alt=""
			src={avatarUrl}
		/>
	)
}

export const PlayerStatus = ({
	nickname
}: PlayerStatusProps) => {
	const nicknameByCookie = null;

	return (
		<Dialog>
			<DialogTrigger className="w-full">
				<div
					title="Перейти к игроку"
					className="flex items-center w-full px-4 py-3 rounded-xl duration-300 hover:bg-neutral-700 bg-neutral-800 justify-start gap-4"
				>
					<PlayerStatusImage type="small" nickname={nickname} />
					<Typography color="white" className="text-xl">
						{nickname}
					</Typography>
					{nicknameByCookie && (
						<Typography color="gray" className="text-lg">
							Это вы
						</Typography>
					)}
				</div>
			</DialogTrigger>
				<DialogContent className="justify-center !max-w-xl">
					<DialogTitle className="text-center">{nickname}</DialogTitle>
					<div className="flex flex-col items-center gap-8 w-full">
						<PlayerStatusImage type="full" nickname={nickname} />
						<div className="flex flex-col gap-2 w-full">
							<Link
								href={`/player/${nickname}`}
								className="inline-flex items-center justify-center whitespace-nowrap
							px-4 py-2 hover:bg-[#05b458] duration-300 ease-in-out bg-[#088d47] rounded-md w-full"
							>
								<p className="text-white text-lg">
									Перейти к профилю
								</p>
							</Link>
							<DialogClose className="w-full">
								<div
									className="inline-flex items-center justify-center whitespace-nowrap
								px-4 py-2 hover:bg-[#E66A6D] bg-[#C65558] rounded-md w-full"
								>
									<p className="text-white text-lg">
										Закрыть
									</p>
								</div>
							</DialogClose>
						</div>
					</div>
				</DialogContent>
		</Dialog>
	)
}