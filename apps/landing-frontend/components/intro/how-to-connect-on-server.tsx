"use client"

import { Typography } from "@repo/landing-ui/src/typography";
import { TooltipWrapper } from "#components/wrappers/tooltip-wrapper";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/landing-ui/src/tooltip";
import { useQuery } from "@tanstack/react-query";
import { FORUM_SHARED_API } from "@repo/shared/constants/api";

async function getServerIp(): Promise<string  | null> {
	const res = await FORUM_SHARED_API("get-server-ip").json<{ data: { ip?: string } } | { error: string }>()

	if ("error" in res) {
    return null;
  }

	return res.data?.ip ?? null;
}

export const serverIpQuery = () => useQuery({
	queryKey: ["server-ip"],
	queryFn: () => getServerIp(),
	refetchOnWindowFocus: false,
	refetchOnMount: false
})

export const actionCopyboard = async (ip: string) => {
	await navigator.clipboard.writeText(ip);

	return toast.success("IP успешно скопирован!")
}

export const HowToConnectOnServer = () => {
	const { data: ip, isLoading } = serverIpQuery()

	if (!ip) return null;

	return (
		<div
			className="flex justify-center items-center bg-repeat border-4 bg-black/20 p-4 relative border-black h-full w-full"
		>
			<div className="flex flex-col gap-y-6 justify-between">
				<div className="flex flex-col gap-y-2">
					<Typography className="text-neutral-400" size="base">
						Название сервера
					</Typography>
					<div className="bg-black py-2 px-2 border-2 border-neutral-500 w-100 md:w-96">
						<Typography size="base" position="left" className="text-white">
							Сервер Minecraft
						</Typography>
					</div>
					<Typography size="base" className="text-neutral-400">
						Адрес сервера
					</Typography>
					<TooltipWrapper
						trigger={
							<Typography
								size="base"
								position="left"
								onClick={() => actionCopyboard(ip ?? "")}
								className="cursor-pointer bg-black py-2 px-2 border-2 text-white border-neutral-500 w-100 md:w-96"
							>
								{isLoading && "загрузка..."}
								{!isLoading && (
									ip ?? "недоступно"
								)}
							</Typography>
						}
						content={
							<Typography size="lg" className="text-neutral-400">
								Скопировать IP
							</Typography>
						}
					/>
				</div>
				<div className="flex flex-col gap-y-2">
					<Tooltip delayDuration={2}>
						<TooltipTrigger>
							<div className="button w-full md:w-96 px-2 py-1">
								<Typography
									shadow="xl"
									className="text-shadow-xl text-[0.8rem] lg:text-base text-white"
									position="center"
								>
									Наборы ресурсов: Включены
								</Typography>
							</div>
						</TooltipTrigger>
						<TooltipContent className="w-fit max-w-[460px]" side="left">
							<Typography size="lg" className="text-neutral-400">
								На сервере используется ресурспак. Эту нужно оставить включенным!
							</Typography>
						</TooltipContent>
					</Tooltip>
					<div className="button w-full md:w-96 px-2 py-1">
						<Typography
							className="text-shadow-xl text-[0.8rem] text-white lg:text-base"
							position="center"
						>
							Готово
						</Typography>
					</div>
				</div>
			</div>
		</div>
	)
}