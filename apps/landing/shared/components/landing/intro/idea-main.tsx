import { getStaticObject } from "@/shared/lib/volume";
import { Link } from "../../config/link";
import { action, atom } from "@reatom/core";
import { reatomComponent } from "@reatom/npm-react";
import { Typography } from "@repo/ui/typography";
import { tv } from "tailwind-variants";
import { Fragment } from "react/jsx-runtime";

const IDEAS = [
	{
		title: "Геймплей",
		image: getStaticObject("images", "steve-alex.webp"),
		description: "Выживайте, создавайте поселения и города, общайтесь с игроками, создавайте себя",
		type: "full"
	},
	{
		title: "Персонализация",
		image: "https://kong.fasberry.su/storage/v1/object/public/static/minecraft/wild-west.webp",
		link: {
			title: "Узнать больше",
			href: "/wiki?tab=profile"
		},
		description: "Создайте себе свой стиль: новые эмоции, частицы и питомцы",
		type: "full"
	},
	{
		title: "Карта",
		image: getStaticObject("images", "map-preview.webp"),
		link: {
			title: "Перейти к карте",
			href: "https://map.fasberry.su"
		},
		description: "На сервере имеется кастомная генерация мира с данжами и замками, поэтому вы не соскучитесь",
		type: "module"
	},
	{
		title: "Квесты",
		image: getStaticObject("images", "casino-barebones.webp"),
		link: {
			title: "Узнать больше",
			href: "/wiki?tab=quests"
		},
		description: "Квесты - неотъемлемая часть геймплея, если вы хотите быстро заработать",
		type: "full"
	},
	{
		title: "Ресурспак",
		image: getStaticObject("images", "custom-armor.webp"),
		link: {
			title: "Узнать больше",
			href: "/wiki?tab=resourcepack"
		},
		description: "Ресурспак добавляет новые предметы: броню, инструменты, оружие и мебель.",
		type: "module"
	},
	{
		title: "Эмоции",
		image: getStaticObject("images", "emotes-preview.webp"),
		link: {
			title: "Узнать больше",
			href: "/wiki?tab=emotes"
		},
		description: "Сервер поддерживает кастомные движения игрока",
		type: "module"
	}
]

const selectedKeyAtom = atom(0, "selectedKey")

const toggle = action((ctx, type: "prev" | "next") => {
	const target = ctx.get(selectedKeyAtom)

	switch (type) {
		case "prev":
			if (target === 0) {
				selectedKeyAtom(ctx, IDEAS.length - 1)
				return
			}
			selectedKeyAtom(ctx, target - 1);
			break;
		case "next":
			if (target === IDEAS.length - 1) {
				selectedKeyAtom(ctx, 0);
				return
			}
			selectedKeyAtom(ctx, target + 1);
			break;
	}
})

const IdeaMainNavigation = reatomComponent<{ type: "next" | "prev" }>(({ ctx, type }) => {
	return (
		<div
			className="flex items-center gap-4 px-4 md:p-0 bg-neutral-800 md:bg-transparent cursor-pointer py-2"
			onClick={() => toggle(ctx, type)}
		>
			{type === 'prev' ? (
				<img src={getStaticObject("minecraft/icons", "large-arrow-left-hover.png")} width={20} loading="lazy" height={20} alt="назад" />
			) : (
				<img src={getStaticObject("minecraft/icons", "large-arrow-right-hover.png")} width={20} loading="lazy" height={20} alt="далее" />
			)}
			<Typography className="inline md:hidden">{type === 'prev' ? 'Назад' : 'Далее'}</Typography>
		</div>
	)
}, `IdeaMainNavigation`)

const navigationBadge = tv({
	base: `flex cursor-pointer duration-300 transition-all border-2 border-neutral-800 px-4 py-2`,
	variants: {
		variant: { unselected: "text-neutral-50", selected: "bg-neutral-50 text-neutral-900", }
	}
})

const previewCard = tv({
	base: `flex flex-col sm:flex-row relative sm:items-center w-full gap-2 lg:w-2/3 
		overflow-hidden p-4 sm:p-6 xl:p-14 h-[360px] lg:h-[460px] lg:max-w-full justify-start rounded-xl`,
	variants: {
		variant: { module: `bg-neutral-300`, full: `` }
	}
})

const previewChildCard = tv({
	base: `flex z-[3] flex-col relative `,
	variants: {
		variant: { module: `sm:w-2/4 w-full`, full: `sm:w-2/3 w-full` }
	}
})


const previewTitle = tv({
	base: `mb-4 text-xl sm:text-3xl lg:text-4xl`,
	variants: {
		variant: { full: `text-neutral-50`, module: `text-neutral-900` }
	}
})

const previewDescription = tv({
	base: `text-shadow-xl text-base sm:text-lg lg:text-xl`,
	variants: {
		variant: { full: `text-neutral-200`, module: `text-neutral-900` }
	}
})

const previewLink = tv({
	base: `text-base sm:text-lg`,
	variants: {
		variant: { full: `text-neutral-300`, module: `text-neutral-700` }
	}
})

const IdeaPreviewCard = reatomComponent(({ ctx }) => {
	const selected = ctx.spy(selectedKeyAtom)

	const { type, image, link, title, description } = IDEAS[selected]

	return (
		<div className={previewCard({ variant: type as "module" | "full" })}>
			{type === 'full' && (
				<div className="absolute top-0 bottom-0 right-0 left-0 w-full h-full">
					<div className="absolute left-0 h-full w-full z-[2] bg-gradient-to-r from-neutral-900/60 via-transparent to-transparent" />
					<img src={image} loading="lazy" alt="" width={1000} height={1000} className="brightness-[55%] w-full h-full object-cover" />
				</div>
			)}
			<div className={previewChildCard({ variant: type as "module" | "full" })}>
				<Typography className={previewTitle({ variant: type as "module" | "full" })}>
					{title}
				</Typography>
				<Typography className={previewDescription({ variant: type as "module" | "full" })}>
					{description}
				</Typography>
				{link && (
					<Link href={link.href} className="w-fit mt-2 sm:mt-4 underline underline-offset-8">
						<Typography className={previewLink({ variant: type as "module" | "full" })}>
							{link.title}
						</Typography>
					</Link>
				)}
			</div>
			{type === 'module' && (
				<div className="flex items-center justify-center w-full sm:w-2/4 h-full">
					<img src={image} loading="lazy" alt="" width={1000} height={1000} className="w-full h-full object-cover rounded-xl" />
				</div>
			)}
		</div>
	)
}, "IdeaPreviewCard")

const IdeaMainNavigationTarget = reatomComponent(({ ctx }) => {
	const selected = ctx.spy(selectedKeyAtom)

	return (
		<div className="hidden md:flex items-center justify-center w-fit">
			{IDEAS.map((preview, idx) => (
				<Fragment key={preview.title}>
					<div
						onClick={() => selectedKeyAtom(ctx, idx)}
						className={navigationBadge({ variant: selected === idx ? "selected" : "unselected" })}
					>
						<Typography className="truncate">{preview.title}</Typography>
					</div>
					{(idx + 1) < IDEAS.length && <hr className="w-4 h-[1px] border-2 border-neutral-600" />}
				</Fragment>
			))}
		</div>
	)
}, "IdeaMainNavigationTarget")

export const IdeaMain = () => {
	return (
		<>
			<div className="flex items-center justify-center w-full gap-6 md:gap-4">
				<IdeaMainNavigation type="prev" />
				<IdeaMainNavigationTarget />
				<IdeaMainNavigation type="next" />
			</div>
			<IdeaPreviewCard />
		</>
	)
}