import { navigate } from "vike/client/router";
import { MDXProvider } from '@mdx-js/react'
import { atom } from "@reatom/core";
import { TabsContent, TabsContents } from "@repo/ui/tabs";
import { WikiTableComponent } from "../table/wiki-table";
import { armorColumnsArmor, armorColumnsDurability, armorColumnsEffects, armorColumnsPopulators, armorColumnsToughness } from "../table-models";
import { Typography } from "@repo/ui/typography";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip";
import { pageContextAtom } from "@/shared/api/global.model";

import General from "./general.mdx"
import Economic from "./economic.mdx"
import Boosts from "./boosts.mdx"
import Jobs from "./jobs.mdx"
import Mobs from "./mobs.mdx"
import Referals from "./ref.mdx"
import Reports from "./reports.mdx"
import Security from "./security.mdx"
import Safety from "./safety.mdx"
import Skills from "./skills.mdx"
import Quests from "./quests.mdx"
import Metro from "./metro.mdx"
import Reputation from "./reputation.mdx"
import Pets from "./pets.mdx"
import Lands from "./lands.mdx"
import Profile from "./profile.mdx"
import Skin from "./skin.mdx"
import { ARMORS } from "@/shared/data/wiki";

export const wikiParamAtom = atom("general", "param")

const ArmorModule = () => {
	return (
		<>
			<Typography className="text-5xl mb-8">
				Новая броня
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что за броня?
			</Typography>
			<Typography className="text-xl mb-6">
				На сервере 5 новых видов брони: адамантитовая, платиновая, кобальтовая, орихалковая и ледяная.
				Каждый вид брони существенно может отличаться друг от друга.
				Также почти каждый вид брони дополняется своим клинком (мечом) и инструментами (кроме мотыги),
				которые также отличаются друг от друга в зависимости от сета.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Распространенность в мире
			</Typography>
			<Typography className="text-xl">
				Чтобы скрафтить броню, нужно сначала найти нужные материалы. В данном случае, материал - слиток.
				Существует всего 4 новых руды - адамантитовая, платиновая, кобальтовая и ледяная.
				Каждая имеет свой шанс появления, а некоторые руды, такие как ледяная, можно найти только в ограниченном
				списке биомов.
			</Typography>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsPopulators}
					table_caption="Добыча и распространность руды"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Крафт
			</Typography>
			<Typography className="text-xl w-fit">
				Крафтится всё довольно просто. Типа:
			</Typography>
			<div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("recipe_cobalt_helmet")}
					alt="Cobalt Helmet"
					width={226}
					height={226}
					annotation="Кобальтовый шлем"
				/>
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("recipe_adamantite_chestplate")}
					alt="Adamantite Chestplate"
					width={226}
					height={226}
					annotation="Адамантитовый нагрудник"
				/>
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("recipe_platinum_legs")}
					alt="Platinum Leggings"
					width={226}
					height={226}
					annotation="Платиновые поножи"
				/>
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("recipe_ice_boots")}
					alt="Ice Boots"
					width={226}
					height={226}
					annotation="Ледяные ботинки"
				/> */}
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Характеристики
			</Typography>
			<Typography className="text-xl mb-6">
				Характеристики являются важной частью брони, поэтому нет брони, которая бы являлась самой лучшей по всем
				пунктам.
				Здесь всё зависит от ваших предпочтений игры: нужна ли вам очень прочная броня, но с посредственной
				защитой или наоборот.
				А может вы вообще любите лёд...
			</Typography>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("adamantite_full_set")}
					alt="Adamantite Armor"
					width={256}
					height={256}
					annotation="Адамантитовая броня"
				/> */}
				<Typography className="text-xl w-fit">
					Любой удар снимает единицы прочности, поэтому это может быть важным пунктом для вашей игры.
					По умолчанию, незеритовая имеет в среднем 400-600 очков прочности, что не очень много, а алмазная вообще
					300-500.
					Кастомная броня предлагает в свою очередь огромный запас прочности в обмен на запрет зачарований с
					аналогичным аттрибутом.
				</Typography>
			</div>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsDurability}
					table_caption="Прочность"
				/>
			</div>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				<Typography className="text-xl w-fit">
					Очки защиты зависят от надетых частей брони, а также от ваших зачарований с этим аттрибутом.
					В таблице указано количество очков для каждого типа брони по её части, так же вы можете
					сложить все значения, чтобы получить общую цифру очков защиты при полном комплекте.
				</Typography>
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("cobalt_full_set")}
					alt="Cobalt Armor"
					width={256}
					height={256}
					annotation="Кобальтовая броня"
				/> */}
			</div>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsArmor}
					table_caption="Защита брони"
				/>
			</div>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("platinum_full_set")}
					alt="Platinum Armor"
					width={256}
					height={256}
					annotation="Платиновая броня"
				/> */}
				<Typography className="text-xl w-fit">
					Броня может дополнительно защитить игрока благодаря аттрибуту <span
						className="italic">твердость брони</span>.
					Обычно броня сводит на нет меньшую часть урона от атак, наносящих больший урон.
					Прочность брони противостоит этому эффекту, уменьшая силу сильных атак.
					Обычно только алмазная и незеритовая броня имеют этот аттрибут, но здесь же, любая кастомная броня имеет
					свои значения.
				</Typography>
			</div>
			<div className="flex flex-col gap-y-2">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsToughness}
					table_caption="Твёрдость брони"
				/>
			</div>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("ice_full_set")}
					alt="Ice Armor"
					width={256}
					height={256}
					annotation="Ледяная броня"
				/> */}
				<Typography className="text-xl w-fit">
					Вдобавок ко всему, каждую броню можно приобрести у кузнеца, но цена конечно будет кусаться.
					Любой вид брони можно изначально скрафтить, если у вас есть ресурсы для этого.
				</Typography>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Редкий сет
			</Typography>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				<Typography className="text-xl w-fit">
					Сейчас существует только 1 набор брони, который невозможно скрафтить и найти в мире - орихалковый.
					Его можно приобрести и использовать только если вы купили его у кузнеца.
					Данный сетап обладает своими особенностями, о которых ниже.
				</Typography>
				{/* <ImageAnnotation
					source={ARMOR_FOLDER_ITEM("orichalcum_full_set")}
					alt="Orichalcum Armor"
					width={256}
					height={256}
					annotation="Орихалковая броня"
				/> */}
			</div>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsEffects}
					table_caption="Особенности брони"
				/>
			</div>
			<TooltipProvider>
				<Tooltip delayDuration={1}>
					<TooltipTrigger>
						<Typography className="text-xl">
							...
						</Typography>
					</TooltipTrigger>
					<TooltipContent className="bg-black border-none p-2 rounded-xl">
						<p className="text-neutral-400 text-lg">Страница дополняется</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</>
	)
}

export const pageSearchParams = atom<Record<string, string>>({}, "pageSearchParams")

pageContextAtom.onChange((ctx, target) => {  
	if (target) pageSearchParams(ctx, target.urlParsed.search)
})

pageSearchParams.onChange((ctx, target) => {
	const tab = target["tab"]

	if (tab) {
		wikiParamAtom(ctx, tab)
	}
})

wikiParamAtom.onChange((ctx, target) => {
	if (!target) return;
	navigate(`/wiki?tab=${target}`)
})

const CONTENT = [
	{
		val: "general",
		component: <General />
	},
	{
		val: "profile",
		component: <Profile />
	},
	{
		val: "economic",
		component: <Economic />
	},
	{
		val: "jobs",
		component: <Jobs />
	},
	{
		val: "reputation",
		component: <Reputation />
	},
	{
		val: "pets",
		component: <Pets />
	},
	{
		val: "metro",
		component: <Metro />
	},
	{
		val: "mobs",
		component: <Mobs />
	},
	{
		val: "safety",
		component: <Safety />
	},
	{
		val: "armor",
		component: <ArmorModule />
	},
	{
		val: "boosts",
		component: <Boosts />
	},
	{
		val: "reports",
		component: <Reports />
	},
	{
		val: "quests",
		component: <Quests />
	},
	{
		val: "skills",
		component: <Skills />
	},
	{
		val: "regions",
		component: <Lands />
	},
	{
		val: "skin",
		component: <Skin />
	},
	{
		val: "referals",
		component: <Referals />
	},
	{
		val: "security",
		component: <Security />
	},
]

const components = {
	// @ts-expect-error
	em(properties) {
		return <i {...properties} />
	}
}

export const WikiContent = () => {
	return (
		<div className="flex flex-col p-4 xl:w-[75%] w-full overflow-hidden lg:w-auto">
			<MDXProvider components={components}>
				<TabsContents>
					{CONTENT.map(con => (
						<TabsContent key={con.val} value={con.val}>
							{con.component}
						</TabsContent>
					))}
				</TabsContents>
			</MDXProvider>
		</div>
	)
}