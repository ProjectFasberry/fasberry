"use client"

import { Typography } from "@repo/landing-ui/src/typography"
import { useRouter } from "next/navigation";
import { Button } from "@repo/landing-ui/src/button";
import NetheriteSword from "@repo/assets/images/minecraft/netherite_sword.webp"
import WildArmor from "@repo/assets/images/minecraft/wild_armor_trim_ыmithing_еemplate.webp"
import { Skeleton } from "@repo/landing-ui/src/skeleton";
import { serverStatusQuery } from "#components/status/server-status";

export const StatusItem = () => {
	const { data: status, isLoading } = serverStatusQuery();
	const { push } = useRouter()

	const serverOnline = status?.proxy.online ?? 0

	return (
		<div
			className="flex flex-col bg-background-light p-4 rounded-xl dark:bg-background-dark h-fit gap-y-4 border-2 border-neutral-600"
		>
			<Typography text_color="adaptiveWhiteBlack" className="text-xl lg:text-2xl">
				Статус
			</Typography>
			<div className="flex flex-col items-start gap-4">
				<div className="flex flex-col gap-2 w-full">
					<div className="grid grid-cols-[1fr_1fr] grid-rows-1 w-full bg-neutral-300/80 dark:bg-neutral-900/80 p-2 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img src={NetheriteSword.src} alt="" width={24} height={24} />
							</div>
							<Typography
								text_color="adaptiveWhiteBlack"
								className="text-md sm:text-base md:text-lg lg:text-xl"
							>
								Bisquite
							</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							{isLoading ? (
								<Skeleton className="h-8 w-24" />
							) : (
								<Typography
									text_color="adaptiveWhiteBlack"
									className="text-md truncate sm:text-base md:text-lg lg:text-xl"
								>
									<span className="hidden sm:inline">играет</span> {status?.servers.bisquite.online} игроков
								</Typography>
							)}
						</div>
					</div>
					<div className="grid grid-cols-[1fr_1fr] gap-2 grid-rows-1 w-full bg-neutral-300/80 dark:bg-neutral-900/80 p-2 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img src={WildArmor.src} alt="" width={24} height={24} />
							</div>
							<Typography
								text_color="adaptiveWhiteBlack"
								className="text-md sm:text-base md:text-lg lg:text-xl"
							>
								Muffin
							</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							<Typography
								text_color="adaptiveGray"
								className="text-md sm:text-base truncate md:text-lg lg:text-xl"
							>
								в разработке...
							</Typography>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between w-full">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Typography
								text_color="adaptiveWhiteBlack"
								className="text-right text-md sm:text-base md:text-lg lg:text-xl"
							>
								Всего:
							</Typography>
							<Skeleton className="h-8 w-8" />
						</div>
					) : (
						<Typography
							text_color="adaptiveWhiteBlack"
							className="text-right text-md sm:text-base md:text-lg lg:text-xl"
						>
							Всего: {serverOnline}
						</Typography>
					)}
					<Button
						onClick={() => push("/status")}
						className="rounded-lg px-6 py-2 bg-neutral-400  dark:bg-neutral-800 dark:hover:bg-neutral-700"
					>
						<Typography
							text_color="adaptiveWhiteBlack"
							className="text-md sm:text-base md:text-lg lg:text-xl"
						>
							Статус
						</Typography>
					</Button>
				</div>
			</div>
		</div>
	)
}