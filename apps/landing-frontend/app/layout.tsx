import type { Metadata } from "next";
import { ReactNode } from "react";
import { TooltipProvider } from "@repo/landing-ui/src/tooltip";
import { Toaster } from "sonner";
import localFont from "next/font/local"
import { NextThemeProvider } from "#components/providers/theme-provider";
import { Header } from "#components/layout/default/header";
import { Footer } from "#components/layout/default/footer";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryProvider } from '#components/providers/query-provider';

import "./globals.css";
import "./minecraft-weather.css"
import "./minecraft-theme.css"
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";

const font = localFont({
	src: "../public/fonts/Monocraft.woff2",
})

export const metadata: Metadata = {
	title: {
		template: "%s | Fasberry",
		default: "Fasberry"
	},
	description: "Официальная страница майнкрафт-проекта Fasberry. Жанр: RP, RPG, полу-ванила. 1.20.1+. Играть: play.fasberry.su.",
	metadataBase: new URL(MINECRAFT_SITE_DOMAIN),
	category: 'videogame',
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	creator: "Fasberry Project Team",
	keywords: ["fasberry", "minecraft", "фасберри", "фесберри", "фесберри проект", "майнкрафт сервер",
		"майнкрафт", "майнкрафт играть", "minecraft play", "сервера майнкрафт бесплатно", "список серверов майнкрафта",
		"полу-ванильные сервера майнкрафта", "полуванила майнкрафт", "rp сервер майнкрафт", "rpg сервер майнкрафт",
		"rp rpg сервер майнкрафт", "город в майнкрафте сервер", "minecraft server", "выживание", "survival minecraft",
		"survival", "smp", "fasberry project", "minecraft fasberry", "minecraft server play"],
	formatDetection: {
		email: true,
		address: true,
		telephone: true,
	},
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: "Fasberry Project",
		description: "Сколько хороших и комфортных для вас майнкрафт-серверов вы знаете/знали? Теперь знаете на один больше.",
		url: MINECRAFT_SITE_DOMAIN,
		locale: "ru_RU",
		type: 'website',
		siteName: "Официальный сайт майнкрафт сервера Fasberry.",
	},
	twitter: {
		title: "Fasberry Project",
		description: "Сколько хороших и комфортных для вас майнкрафт-серверов вы знаете/знали? Теперь знаете на один больше.",
		images: "https://mc.fasberry.su/favicon.ico"
	}
};

export default function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<head>
				<meta name="yandex-verification" content="79ef4427896b5175" />
			</head>
			<body className={font.className}>
				<QueryProvider>
					<ReactQueryDevtools />
					<NextThemeProvider>
						<Toaster
							position="top-left"
							richColors
							icons={{
								info: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
								error: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
								success: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />,
								warning: <img width={32} height={32} alt="" loading="lazy" draggable={false} src="/images/minecraft/icons/book_big.webp" />
							}}
						/>
						<TooltipProvider>
							<Header />
							{children}
							<Footer />
						</TooltipProvider>
					</NextThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}