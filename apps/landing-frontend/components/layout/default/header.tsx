"use client"

import { usePathname, useRouter } from 'next/navigation'
import { MAIN_HEADER } from '@repo/shared/wiki/data/configs';
import { Typography } from '@repo/landing-ui/src/typography';
import { toast } from 'sonner';
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@repo/landing-ui/src/dropdown-menu";
import { HeaderSheet } from "#components/layout/default/header-sheet";
import { Skeleton } from "@repo/landing-ui/src/skeleton";
import dynamic from "next/dynamic";
import { ComponentPropsWithRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '#components/header/avatar/components/avatar';

const getCookieByKey = (key: string): string | null => {
	const cookies = document.cookie.split('; ');

	for (const cookie of cookies) {
		const [cookieKey, cookieValue] = cookie.split('=');

		if (!cookieValue) break;

		if (cookieKey === key) {
			return decodeURIComponent(cookieValue);
		}
	}

	return null;
};

const ThemeToggle = dynamic(() => import("#components/layout/default/header-theme-toggle").then(m => ({
	default: m.ThemeToggle
})), {
	ssr: false,
	loading: () => <Skeleton className="w-[36px] h-[36px]" />,
})

export const SuperLink = (props: ComponentPropsWithRef<typeof Link>) => {
	const router = useRouter();
	const strHref = typeof props.href === "string" ? props.href : props.href.href;

	return (
		<Link
			{...props}
			prefetch={false}
			onMouseEnter={(e) => {
				if (strHref) {
					void router.prefetch(strHref);
				}

				return props.onMouseEnter?.(e);
			}}
		/>
	);
};

export const headerUserQuery = () => useQuery({
	queryKey: ["header-user"],
	queryFn: async () => {
		const userFromCookie = getCookieByKey("user")

		if (!userFromCookie) {
			return null
		}

		return userFromCookie
	},
	refetchOnWindowFocus: false,
	refetchOnMount: false,
	refetchOnReconnect: false,
	retry: 1
})

const HeaderUser = ({ nickname }: { nickname: string }) => {
	return (
		<Link href={`/player/${nickname}`} className="w-[38px] h-[38px] overflow-hidden rounded-md border border-neutral-400">
			<Avatar nickname={nickname} propHeight={38} propWidth={38} />
		</Link>
	)
}

export const Header = () => {
	const pathname = usePathname();
	const { data: nickname, isError } = headerUserQuery()

	const pathDetect = (href: string) => {
		if (href) {
			if (pathname === href) {
				return toast.info("Вы уже на этой странице!", {
					icon: <img alt="" loading="lazy" width={32} height={32} src="/images/minecraft/icons/bell.webp" />
				})
			}
		}
	}

	return (
		<div
			className="header flex items-center justify-between absolute top-0 transition w-full bg-repeat-x z-50
				bg-[url('/images/static/cracked_polished_blacked.webp')] "
			style={{ backgroundSize: '160px' }}
		>
			<Link href="/" className="bg-transparent cursor-pointer relative md:-right-[40px] top-3 xl:-right-[60px]">
				<img
					src="/images/fasberry_logo.webp"
					width={224}
					height={64}
					title="Fasberry"
					alt="Fasberry"
				/>
			</Link>
			<div className="hidden xl:flex gap-x-4 items-center justify-start pr-[132px]">
				{MAIN_HEADER.map(({ href, name, childs }) => {
					const isActive = pathname === href;

					const activePathName = MAIN_HEADER.find(
						i => href === pathname
					)?.name || "activePathName";

					return (
						<DropdownMenu key={name}>
							<DropdownMenuTrigger className="group">
								<SuperLink
									onClick={() => {
										if (href) {
											pathDetect(href)
										}
									}}
									href={href || "/"}
									className="flex items-center gap-1 cursor-pointer"
								>
									{isActive && (
										<img
											src="/images/minecraft/icons/experience_big.webp"
											title={activePathName}
											width={20}
											alt=""
											loading="lazy"
											height={20}
										/>
									)}
									<Typography
										className={`hover:brightness-150 text-project-color text-lg
          			      ${isActive && 'brightness-[1.8]'} ${href == "/shop" && 'text-gold'}`
										}
									>
										{name}
									</Typography>
									{childs && (
										<>
											<span className="text-white group-data-[state=open]:inline hidden">⏶</span>
											<span className="text-white group-data-[state=closed]:inline hidden">⏷</span>
										</>
									)}
								</SuperLink>
							</DropdownMenuTrigger>
							{childs && (
								<DropdownMenuContent className="border" side="bottom" align="end">
									<div className="flex flex-col py-2 px-4 gap-2 w-full">
										{childs.map(item => {
											const isActive = item.href === pathname;

											return (
												<div key={item.name} className="flex items-center gap-1 cursor-pointer">
													{isActive && (
														<img
															src="/images/minecraft/icons/experience_big.webp"
															title={activePathName}
															width={16}
															alt=""
															loading="lazy"
															height={16}
														/>
													)}
													<SuperLink href={item.href || "/"}>
														<Typography className="hover:brightness-150 text-lg text-project-color">
															{item.name}
														</Typography>
													</SuperLink>
												</div>
											)
										})}
									</div>
								</DropdownMenuContent>
							)}
						</DropdownMenu>
					)
				})}
				{(nickname && !isError) && (
					<HeaderUser nickname={nickname} />
				)}
				<div className="w-[36px] h-[36px] overflow-hidden">
					<ThemeToggle />
				</div>
			</div>
			<HeaderSheet />
		</div>
	);
};