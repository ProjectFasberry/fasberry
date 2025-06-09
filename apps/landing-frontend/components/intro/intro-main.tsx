"use client"

import { Typography } from "@repo/landing-ui/src/typography";
import { useState } from "react";
import Link from "next/link";

export const MINECRAFT_MAP_SITE_DOMAIN = "https://mc.fasberry.su"

type Idea = {
	title: string,
	image: string,
	description: string,
	link?: {
		title: string,
		href: string
	},
	type: "module" | "full"
}

const IDEAS: Idea[] = [
	{
		title: "Геймплей",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/steve-alex.webp",
		description: "Выживайте, создавайте поселения и города, общайтесь с игроками, создавайте себя",
		type: "full"
	},
	{
		title: "Персонализация",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/wild-west.webp",
		link: {
			title: "Узнать больше",
			href: "https://mc.fasberry.su/wiki?tab=profile"
		},
		description: "Создайте себе свой стиль: новые эмоции, частицы и питомцы",
		type: "full"
	},
	{
		title: "Карта",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/map-preview.png",
		link: {
			title: "Перейти к карте",
			href: MINECRAFT_MAP_SITE_DOMAIN
		},
		description: "На сервере имеется кастомная генерация мира с данжами и замками, поэтому вы не соскучитесь",
		type: "module"
	},
	{
		title: "Квесты",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/casino-barebones.webp",
		link: {
			title: "Узнать больше",
			href: "https://mc.fasberry.su/wiki?tab=quests"
		},
		description: "Квесты - неотъемлемая часть геймплея, если вы хотите быстро заработать",
		type: "full"
	},
	{
		title: "Ресурспак",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/custom-armor.png",
		link: {
			title: "Узнать больше",
			href: "https://mc.fasberry.su/wiki?tab=resourcepack"
		},
		description: "Ресурспак добавляет новые предметы: броню, инструменты, оружие и мебель.",
		type: "module"
	},
	{
		title: "Эмоции",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/emotes-preview.webp",
		link: {
			title: "Узнать больше",
			href: "https://mc.fasberry.su/wiki?tab=emotes"
		},
		description: "Сервер поддерживает кастомные движения игрока",
		type: "module"
	}
]

export const IdeaMain = () => {
	const [sel, setSel] = useState<number>(0);

	const handleToggle = (type: "prev" | "next") => {
		switch (type) {
			case "prev":
				if (sel === 0) {
					setSel(IDEAS.length - 1)
					return
				}

				setSel(sel - 1);
				break;
			case "next":
				if (sel === IDEAS.length - 1) {
					setSel(0);
					return
				}

				setSel(sel + 1);
				break;
		}
	}

	return (
		<>
			<div className="flex items-center justify-center w-full gap-6 md:gap-4">
				<div
					onClick={() => handleToggle("prev")}
					className="flex items-center gap-4 rounded-lg px-4 md:p-0 bg-neutral-800 md:bg-transparent cursor-pointer py-2"
				>
					<img
						src="/images/minecraft/icons/large-arrow-left-hover.png"
						width={20}
						height={20}
						alt="Previous"
					/>
					<Typography className="inline md:hidden">
						Назад
					</Typography>
				</div>
				<div className="hidden md:flex items-center gap-4 justify-center w-fit">
					{IDEAS.map((n, idx) => (
						<div
							key={n.title}
							onClick={() => setSel(idx)}
							className={`flex cursor-pointer duration-300 transition-all border-2 border-neutral-800 rounded-xl px-4 py-2
							${sel === idx ? "bg-neutral-50 text-neutral-900" : "text-neutral-900 dark:text-neutral-50"}`}
						>
							<Typography className="truncate">{n.title}</Typography>
						</div>
					))}
				</div>
				<div
					onClick={() => handleToggle("next")}
					className="flex items-center gap-4 rounded-lg px-4 md:p-0 bg-neutral-800 md:bg-transparent cursor-pointer py-2"
				>
					<Typography className="inline md:hidden">
						Далее
					</Typography>
					<img
						src="/images/minecraft/icons/large-arrow-right-hover.png"
						width={20}
						height={20}
						alt="Next"
					/>
				</div>
			</div>
			<div
				className={`flex flex-col sm:flex-row relative sm:items-center w-full gap-2 lg:w-2/3 justify-between overflow-hidden
					${IDEAS[sel]?.type === 'module' && "bg-neutral-300"} 
					p-4 sm:p-6 xl:p-14 h-[360px] lg:h-[460px] w-full lg:max-w-full justify-start rounded-xl
				`}
			>
				{IDEAS[sel]?.type === 'full' && (
					<div className="absolute top-0 bottom-0 right-0 left-0 w-full h-full">
						<div className="absolute left-0 h-full w-full z-[2] bg-gradient-to-r from-neutral-900/60 via-transparent to-transparent"/>
						<img
							src={IDEAS[sel].image}
							alt=""
							width={1000}
							height={1000}
							className="brightness-[55%] w-full h-full object-cover"
						/>
					</div>
				)}
				<div className={`flex z-[3] flex-col relative ${IDEAS[sel]?.type === 'module' ? "w-full sm:w-2/4" : "w-full sm:w-2/3"}`}>
					<Typography
						className={`${IDEAS[sel]?.type === 'module' ? "text-neutral-900" : "text-neutral-50"} mb-4 text-xl sm:text-3xl lg:text-4xl`}
					>
						{IDEAS[sel]?.title}
					</Typography>
					<Typography
						shadow="xl"
						className={`${IDEAS[sel]?.type === 'module' ? "text-neutral-900" : "text-neutral-200"} text-base sm:text-lg lg:text-xl`}
					>
						{IDEAS[sel]?.description}
					</Typography>
					{IDEAS[sel]?.link && (
						<Link
							target="_blank"
							href={IDEAS[sel].link.href}
							className="w-fit mt-2 sm:mt-4 underline underline-offset-8"
						>
							<Typography
								className={`${IDEAS[sel].type === 'module' ? "text-neutral-700" : "text-neutral-300"} text-base sm:text-lg`}
							>
								{IDEAS[sel].link.title}
							</Typography>
						</Link>
					)}
				</div>
				{IDEAS[sel]?.type === 'module' && (
					<div className="flex items-center justify-center w-full sm:w-2/4 h-full">
						<img
							src={IDEAS[sel].image}
							alt=""
							width={1000}
							height={1000}
							className="w-full h-full object-cover rounded-xl"
						/>
					</div>
				)}
			</div>
		</>
	)
}