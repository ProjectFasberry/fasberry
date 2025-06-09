"use client"

import { Typography } from "@repo/landing-ui/src/typography";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@repo/landing-ui/src/dialog";
import { PlayerStatusImage } from "#components/status/player-status-image";
import Link from "next/link";
import { headerUserQuery } from "../layout/default/header";

export type PlayerStatusProps = {
	nickname: string
}

export const PlayerStatus = ({
	nickname
}: PlayerStatusProps) => {
	const { data: nicknameByCookie } = headerUserQuery()

	return (
		<Dialog>
			<DialogTrigger className="w-full">
				<div
					title="Перейти к игроку"
					className="flex items-center w-full px-4 py-3 rounded-xl
					hover:bg-neutral-200 transtion-all duration-300 ease-in-out dark:hover:bg-neutral-700 bg-neutral-300 dark:bg-neutral-800 cursor-pointer justify-start gap-4"
				>
					<PlayerStatusImage type="small" nickname={nickname}/>
					<Typography className="text-xl dark:text-white">
						{nickname}
					</Typography>
					{nicknameByCookie && (
						<Typography className="text-neutral-400 text-lg">
							Это вы
						</Typography>
					)}
				</div>
			</DialogTrigger>
			<DialogContent className="justify-center !max-w-xl">
				<DialogTitle className="text-center">{nickname}</DialogTitle>
				<div className="flex flex-col items-center gap-8 w-full">
					<PlayerStatusImage type="full" nickname={nickname}/>
					<div className="flex flex-col gap-2 w-full">
						<Link
							href={`/player/${nickname}`}
							target="_blank"
							className="inline-flex items-center justify-center whitespace-nowrap
							px-4 py-2 hover:bg-[#05b458] transition-all duration-300 ease-in-out bg-[#088d47] rounded-[6px] w-full"
						>
							<Typography className="text-white text-lg">
								Перейти к профилю
							</Typography>
						</Link>
						<DialogClose className="w-full">
							<div
								className="inline-flex items-center justify-center whitespace-nowrap
								px-4 py-2 hover:bg-[#E66A6D] bg-[#C65558] rounded-[6px] w-full"
							>
								<Typography className="text-white text-lg">
									Закрыть
								</Typography>
							</div>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}