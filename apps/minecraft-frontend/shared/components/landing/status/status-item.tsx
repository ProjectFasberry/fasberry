import NetheriteSword from "@repo/assets/images/minecraft/netherite_sword.webp"
import WildArmor from "@repo/assets/images/minecraft/wild_armor_trim_ыmithing_еemplate.webp"
import { Link } from "@/shared/components/config/Link";
import { serverStatusResource } from "./server-status";
import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@/shared/ui/skeleton";
import { Typography, typographyVariants } from "@/shared/ui/typography";
import { tv } from "tailwind-variants";

const serverTitle = tv({
	extend: typographyVariants,
	base: `text-md sm:text-base md:text-lg lg:text-xl`
})

const descTitle = tv({
	extend: typographyVariants,
	base: `text-md sm:text-base truncate md:text-lg lg:text-xl`
})

export const StatusItem = reatomComponent(({ ctx }) => {
	const status = ctx.spy(serverStatusResource.dataAtom);
	const isLoading = ctx.spy(serverStatusResource.statusesAtom).isPending

	const serverOnline = status?.proxy.online ?? 0

	return (
		<div className="flex flex-col bg-background-light p-4 rounded-xl dark:bg-background-dark h-fit gap-y-4">
			<Typography color="white" className="text-xl lg:text-2xl">
				Статус
			</Typography>
			<div className="flex flex-col items-start gap-4">
				<div className="flex flex-col gap-2 w-full">
					<div className="grid grid-cols-[1fr_1fr] grid-rows-1 w-full bg-neutral-900/80 p-2 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img src={NetheriteSword} alt="" width={24} height={24} />
							</div>
							<Typography color="white" className={serverTitle()}>Bisquite</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							{isLoading ? <Skeleton className="h-8 w-24" /> : (
								<Typography color="gray" className={descTitle()}>
									<span className="hidden sm:inline">играет</span> {status?.servers.bisquite.online} игроков
								</Typography>
							)}
						</div>
					</div>
					<div className="grid grid-cols-[1fr_1fr] gap-2 grid-rows-1 w-full bg-neutral-900/80 p-2 rounded-xl">
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex items-center justify-center bg-neutral-700/40 rounded-lg p-2">
								<img src={WildArmor} alt="" width={24} height={24} />
							</div>
							<Typography color="white" className={serverTitle()}>Muffin</Typography>
						</div>
						<div className="flex items-center w-full justify-end gap-3">
							<Typography color="gray" className={descTitle()}>в разработке...</Typography>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between w-full">
					{isLoading ? (
						<div className="flex items-center gap-2">
							<Typography color="white" className={descTitle({ className: "text-right" })}>
								Всего:
							</Typography>
							<Skeleton className="h-8 w-8" />
						</div>
					) : (
						<Typography color="white" className={descTitle({ className: "text-right" })}>
							Всего: {serverOnline}
						</Typography>
					)}
					<Link href={"/status"}>
						<button className="btn rounded-lg px-6 py-2 bg-neutral-800 hover:bg-neutral-700">
							<Typography color="white" className="text-md sm:text-base md:text-lg lg:text-xl">
								Статус
							</Typography>
						</button>
					</Link>
				</div>
			</div>
		</div>
	)
}, "StatusItem")