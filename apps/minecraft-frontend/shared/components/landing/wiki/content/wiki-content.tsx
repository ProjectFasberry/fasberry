import { useEffect } from "react";
import { ARMORS } from "@repo/shared/wiki/data/wiki/wiki-list";
import {
	armorColumnsArmor,
	armorColumnsDurability,
	armorColumnsEffects,
	armorColumnsPopulators,
	armorColumnsToughness
} from "@/shared/components/landing/wiki/table-models";
import { WIKI_HEADERS } from "@repo/shared/wiki/data/configs";
import {
	ANIMALS_FOLDER_ITEM,
	ARMOR_FOLDER_ITEM,
	LOCATION_FOLDER_ITEM,
	MENUS_FOLDER_ITEM,
	OTHER_FOLDER_ITEM,
	PETS_FOLDER_ITEM,
	REGIONS_FOLDER_ITEM,
	WALLETS_FOLDER_ITEM
} from "@repo/shared/wiki/data/folders";
import { Typography } from "@/shared/ui/typography";
import { navigate } from "vike/client/router";
import { Accordion, Dialog, Portal, Tabs } from "@ark-ui/react";
import { WikiNavigationBar } from "../sidebar/wiki-navigation-bar";
import { usePageContext } from "vike-react/usePageContext";
import { Tooltip } from "@/shared/ui/tooltip";
import { HTMLAttributes } from 'react';
import { tv, VariantProps } from "tailwind-variants";
import { clientOnly } from "vike-react/clientOnly";
import { Link } from "@/shared/components/config/Link";

const WikiTableComponent = clientOnly(() => import("../table/wiki-table").then(m => m.WikiTableComponent))

interface ImageAnnotationProps {
	source: string,
	alt: string
	annotation?: string,
	width?: number, 
	height?: number
}

const ImageAnnotation = ({ 
	source, alt, annotation, width, height
}: ImageAnnotationProps) => {
	return (
		<div className="flex flex-col items-center gap-y-4">
			<img
				src={source}
				alt={alt}
				width={width || 360}
				height={height || 360}
				loading="lazy"
			/>  
			<p className="text-md text-white md:text-lg">
				{annotation}
			</p>
		</div>
	)
}

const commandLineVariants = tv({
	base: `p-1 cursor-pointer inline-flex`,
	variants: {
		variant: {
			default: "px-2 py-1 rounded-md bg-neutral-600 dark:bg-neutral-800 text-white"
		},
		padding: {
			normal: "px-4 py-2",
			big: "px-6 py-4",
		},
	},
	defaultVariants: {
		variant: "default"
	}
})

export interface CommandLineProps
	extends HTMLAttributes<HTMLSpanElement>,
	VariantProps<typeof commandLineVariants> { }

export const CommandLine = ({
	className, variant, padding, ...props
}: CommandLineProps) => {
	return (
		<span className={commandLineVariants({ variant, padding, className })} {...props}/>
	)
}

const contentModuleVariants = tv({
	base: `data-[state=active]:flex data-[state=inactive]:hidden flex-col gap-y-4 overflow-x-auto`,
	variants: {
		variant: {
			started: "items-start",
			centered: "items-center"
		},
		defaultVariant: {
			variant: "started",
		}
	}
})

interface ContentModule
	extends HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof contentModuleVariants> {
	id: string,
	value: string,
}

const ContentModule = ({
	id, value, className, variant, ...props
}: ContentModule) => {
	return (
		<Tabs.Content
			id={id}
			value={value}
			className={contentModuleVariants({ className, variant })}
			{...props}
		/>
	)
}

const GeneralModule = () => {
	return (
		<ContentModule id="general" value="general" role="tab">
			<Typography className="text-5xl mb-8">
				Основной раздел
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				О проекте
			</Typography>
			<Typography className="text-xl mb-6">
				Fasberry - это игровой проект, нацеленный на улучшение получения опыта от игры и большему удовольствию от
				геймплея Minecraft.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что тут?
			</Typography>
			<Typography className="text-xl mb-6">
				Это вики проекта - основной источник информации по всем аспектам игры на нашем проекте.
				Здесь можно найти все доступные команды игрока по кланам, регионам
				и т.д, а также найти полезные советы по игре.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Не нашёл ответа на свой вопрос
			</Typography>
			<Typography className="text-xl mb-6">
				Если ты не нашёл здесь ответа на свой вопрос, задай его в игровом чате, указав &quot;?&quot; перед
				текстом.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Хотите быть частью нашей команды?
			</Typography>
			<Typography className="text-xl">
				Мы набираем людей, которые готовы уделять время на развитие проекта.
				Это безвозмездная помощь тебе, ибо ты получаешь от нас крутые плюшки на сервере, и нам, потому что мы
				освобождаем
				себе остальное время, которое и так тратится очень много.
			</Typography>
			<Typography className="text-xl">
				Теперь хочешь? Напиши в дискорде модератору или владельцу проекта о своём желании и дождись ответа.
			</Typography>
		</ContentModule>
	)
}

const ProfileModule = () => {
	return (
		<ContentModule value="profile" role="tab" id="profile">
			<Typography className="text-5xl mb-8">
				Профиль
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что такое профиль?
			</Typography>
			<Typography className="text-xl mb-6">
				Профиль это удобный источник информации о вас, как игроке.
				Здесь собрана информация о ваших наигранных часах, достижениях, коллекционировании и др. А также отсюда
				можно попасть в
				меню ваших питомцев или вашего клана. Открыть можно командой
				- <CommandLine>/profile</CommandLine> или <CommandLine>/профиль</CommandLine>.
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("profile")}
					alt="Меню профиля"
					annotation="Меню профиля"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Личные настройки
			</Typography>
			<Typography className="text-xl">
				Вы можете попасть в настройки через профиль или прописав команду&nbsp;
				<CommandLine>/settings</CommandLine>.
				Здесь содержатся различные настройки для вашей игры, например, отображение подсказок в чате или гравитация
				для деревьев.
			</Typography>
		</ContentModule>
	)
}

const EconomicModule = () => {
	const { setTab } = useWikiNavigation()

	return (
		<ContentModule value="economic" role="tab" id="economic" className="flex flex-col gap-y-4">
			<Typography className="text-5xl mb-8">
				Экономика
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Валюты
			</Typography>
			<Typography className="text-xl mb-6">
				На сервере две валюты: харизма и белкоин. Но основной является - харизма.
				Добыть её можно многими способами: зарабатывая на&nbsp;
				<span
					onClick={() => setTab("jobs")}
					className="text-[#00cdb0] cursor-pointer text-shadow-xl">работах
				</span>,
				находя уникальные предметы, участвуя в заданиях местных
				жителей Оффенбурга, посредством обмена белкоинов, за редкие достижения.
			</Typography>
			<div className="flex items-center gap-x-16 justify-center">
				<ImageAnnotation
					source={WALLETS_FOLDER_ITEM("charism")}
					alt="Charism"
					width={96}
					height={96}
					annotation="Харизма"
				/>
				<ImageAnnotation
					source={WALLETS_FOLDER_ITEM("belkoin")}
					alt="Belkoin"
					width={96}
					height={96}
					annotation="Белкоин"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что можно купить за харизму?
			</Typography>
			<Typography className="text-xl mb-6">
				За харизму можно купить: эффекты, питомцев, бусты, декоративные иконки для таба, спавнеры, какие-либо
				ресурсы в магазинах.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что можно купить на белкоины?
			</Typography>
			<Typography className="text-xl mb-6">
				За белкоины можно купить бусты, привилегию &quot;Аутентик&quot;, а также обменять их на харизму.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Где обменять валюту?
			</Typography>
			<Typography className="text-xl">
				Валюту можно обменять у банкира в банке. Открыть банк можно
				командой <CommandLine>/banker</CommandLine> или сходить самому в местный банк, в который можно попасть
				через метро или найти самому - это не сложно.
			</Typography>
			<div className="flex items-center gap-x-16 justify-center">
				<ImageAnnotation
					source={LOCATION_FOLDER_ITEM("bank")}
					alt="Bank"
					width={800}
					height={600}
					annotation="Местный банк, находится у городской реки"
				/>
			</div>
		</ContentModule>
	)
}

const JobsModule = () => {
	return (
		<ContentModule value="jobs" role="tab" id="jobs">
			<Typography className="text-5xl mb-8">
				Работы
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как начать зарабатывать?
			</Typography>
			<Typography className="text-xl mb-6">
				Достаточно ввести команду <CommandLine>/jobs</CommandLine>, и нажать ПКМ по интересующей вам работе.
				Обычный игрок может быть устроен только на 1 работу одновременно!
				А также, при увольнении большая часть опыта вашей работы будет удалена. Помните об этом!
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Прогресс работы
			</Typography>
			<Typography className="text-xl mb-6">
				Сюда входит уровень вашей работы, который увеличивается от всех ваших действий (например: от копания
				железной руды, если вы шахтёр).
				И опыт, который напрямую влияет на уровень работы: чем его больше - тем выше уровень. Каждый уровень
				содержит в себе определенную планку опыта, которую нужно достичь,
				чтобы получить следующий уровень.
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("jobs_info")}
					alt="Jobs Preview"
					annotation="Описание работы"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Лимиты
			</Typography>
			<Typography className="text-xl">
				У каждой работы есть лимит на добытые средства и опыт в сутки, обычн он зависит от вашего уровня
				конкретной работы, чем выше уровень -
				тем больше вы можете заработать харизму и опыт за сутки.
			</Typography>
		</ContentModule>
	)
}

const ReputationModule = () => {
	const { setTab } = useWikiNavigation()

	return (
		<ContentModule value="reputation" role="tab" id="reputation" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Репутация
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как получать?
			</Typography>
			<Typography className="text-xl mb-6">
				Влиять на репутацию могут только игроки: лайкать и дизлайкать вас. Иным способом её не получить.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Зачем нужна репутация?
			</Typography>
			<Typography className="text-xl mb-6">
				Она открывает доступ к самым уникальным вещам: орихалковой броне, демоническому молоту и т.д.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как узнать сколько у меня репутации?
			</Typography>
			<Typography className="text-xl mb-6">
				Можно узнать, введя команду <CommandLine>/rep me</CommandLine>, а также в&nbsp;
				<span
					onClick={() => setTab("profile")}
					className="text-[#00cdb0] cursor-pointer">профиле</span> или скорборде.
			</Typography>
			<Tooltip
				trigger={
					<Typography className="text-xl">
						...
					</Typography>
				}
				content={
					<div className="bg-black border-none p-2 rounded-xl">
						<p className="text-neutral-400 text-lg">Страница дополняется</p>
					</div>
				}
			/>
		</ContentModule>
	)
}

const PetsModule = () => {
	return (
		<ContentModule value="pets" role="tab" id="pets" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Питомцы
			</Typography>
			<Typography className="text-xl mb-6">
				Питомцы это всегда что-то милое и приятное, особенно когда они могут вас защищать и давать вам различные
				улучшения.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Типы питомцев
			</Typography>
			<Typography className="text-xl">
				Существует два типа питомцев: питомцы-головы и питомцы-уникальные.
			</Typography>
			<Typography className="text-xl mb-6">
				Питомцы-головы представляют из себя летающие головы, которые будут следовать за вами сзади вас. Каждый
				такой питомец имеет в себе плюсы и минусы.
			</Typography>
			<Typography className="text-xl mb-6">
				Питомцы-уникальные - это отдельные сущности в виде новых мобов, которые могут вас защищать в случае
				опасности. На некоторых можно даже передвигаться.
				Они естественно дороже чем питомцы-головы и купить их можно на второй странице магазина питомцев.
			</Typography>
			<div className="flex items-center gap-x-6 justify-center mb-6">
				<ImageAnnotation
					source={PETS_FOLDER_ITEM("duolingo_pet")}
					alt="Pet Head"
					width={800}
					height={600}
					annotation="Питомец-голова 'Дуолинго'"
				/>
				<ImageAnnotation
					source={PETS_FOLDER_ITEM("moth_unique")}
					alt="Pet Unik"
					width={800}
					height={600}
					annotation="Питомец-уникальный в виде мотылька"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как получить питомцев?
			</Typography>
			<Typography className="text-xl mb-6">
				Изначально любой игрок имеет бесплатных двух питомцев-голов: собака и кошка. Любого другого питомца нужно
				покупать. Купить можно, поговорив с
				анималистом Кирой или введя
				команду <CommandLine>/store_pets</CommandLine> или <CommandLine>/магазин_питомцы</CommandLine>
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как активировать питомцев?
			</Typography>
			<Typography className="text-xl">
				Активировать купленных питомцев можно через меню ваших питомцев
				- <CommandLine>/pets</CommandLine> либо <CommandLine>/питомцы</CommandLine>.
				Деактивировать можно там же.
			</Typography>
			<Typography className="text-xl mb-6">
				Чтобы сесть на питомца (если питомец такое позволяет), нужно ввести команду <CommandLine>/pets
					mount</CommandLine>.
			</Typography>
			<div className="flex items-center justify-center">
				<ImageAnnotation
					source={PETS_FOLDER_ITEM("capybara_unique")}
					alt="Pet Capibara"
					width={800}
					height={600}
					annotation="Езда на капибаре"
				/>
			</div>
		</ContentModule>
	)
}

const MetroModule = () => {
	return (
		<ContentModule value="metro" role="tab" id="metro">
			<Typography className="text-5xl mb-8">
				Система метро
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что такое метро?
			</Typography>
			<Typography className="text-xl mb-6">
				Метро - место, откуда можно быстро добраться до разных локаций города.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Где находится метро?
			</Typography>
			<Typography className="text-xl mb-6">
				Метро находится сразу справа от вас, как вы телепортируетесь на спавн.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как быстро добраться до места?
			</Typography>
			<Typography className="text-xl mb-6">
				Подойдите к контроллеру и нажмите ПКМ, чтобы начать разговор.
				В разговоре вы можете выбрать тип вашего назначения и телепортироваться, нажав также на ПКМ.
			</Typography>
			<div className="flex items-center justify-center">
				<ImageAnnotation
					source={LOCATION_FOLDER_ITEM("metro")}
					alt="Metro"
					width={800}
					height={600}
					annotation="Само метро"
				/>
			</div>
		</ContentModule>
	)
}

const MobsModule = () => {
	return (
		<ContentModule value="mobs" role="tab" id="mobs" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Новые мобы
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что за мобы?
			</Typography>
			<Typography className="text-xl mb-6">
				Их более 10: медведь, тукан, пеликан, гусь, сова, павлин, белка, краб, крокодил, бабочка, фламинго,
				дракон (красный, голубой, нефритовый), крыса (серая, черная, коричневая).
				Каждый из которых по-разному распространён в мире. После убийства может выпасть разное количество опыта,
				в зависимости от моба, а также различный лут.
				Если у вас есть идеи и предложения по поводу мобов - пишите в дискорде.
			</Typography>
			<Typography className="text-xl mb-6">
				Ниже некоторые из мобов, позже появится подробная информация по луту, опыту и другим характериситкам
				каждого моба.
			</Typography>
			<div className="flex items-center justify-center gap-2 flex-wrap">
				<ImageAnnotation
					source={ANIMALS_FOLDER_ITEM("peacock")}
					alt="Peacock"
					width={400}
					height={200}
					annotation="Павлин"
				/>
				<ImageAnnotation
					source={ANIMALS_FOLDER_ITEM("bear")}
					alt="Bear"
					width={400}
					height={200}
					annotation="Медведь"
				/>
				<ImageAnnotation
					source={ANIMALS_FOLDER_ITEM("rat")}
					alt="Rat"
					width={400}
					height={200}
					annotation="Крыса"
				/>
				<ImageAnnotation
					source={ANIMALS_FOLDER_ITEM("dragon")}
					alt="Dragon"
					width={400}
					height={200}
					annotation="Голубой дракон"
				/>
			</div>
			<Tooltip
				trigger={
					<Typography className="text-xl">
						...
					</Typography>
				}
				content={
					<div className="bg-black border-none p-2 rounded-xl">
						<p className="text-neutral-400 text-lg">Страница дополняется</p>
					</div>
				}
			/>
		</ContentModule>
	)
}

const ArmorModule = () => {
	return (
		<ContentModule value="armor" role="tab" id="armor">
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
				<ImageAnnotation
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
				/>
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
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("adamantite_full_set")}
					alt="Adamantite Armor"
					width={256}
					height={256}
					annotation="Адамантитовая броня"
				/>
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
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("cobalt_full_set")}
					alt="Cobalt Armor"
					width={256}
					height={256}
					annotation="Кобальтовая броня"
				/>
			</div>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsArmor}
					table_caption="Защита брони"
				/>
			</div>
			<div className="flex justify-between flex-col lg:flex-row gap-y-6 gap-x-12 mb-6">
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("platinum_full_set")}
					alt="Platinum Armor"
					width={256}
					height={256}
					annotation="Платиновая броня"
				/>
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
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("ice_full_set")}
					alt="Ice Armor"
					width={256}
					height={256}
					annotation="Ледяная броня"
				/>
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
				<ImageAnnotation
					source={ARMOR_FOLDER_ITEM("orichalcum_full_set")}
					alt="Orichalcum Armor"
					width={256}
					height={256}
					annotation="Орихалковая броня"
				/>
			</div>
			<div className="flex flex-col gap-y-2 mb-6">
				<WikiTableComponent
					array_name={ARMORS}
					columns={armorColumnsEffects}
					table_caption="Особенности брони"
				/>
			</div>
			<Tooltip
				trigger={
					<Typography className="text-xl">
						...
					</Typography>
				}
				content={
					<div className="bg-black border-none p-2 rounded-xl">
						<p className="text-neutral-400 text-lg">Страница дополняется</p>
					</div>
				}
			/>
		</ContentModule>
	)
}

const SafetyModule = () => {
	return (
		<ContentModule value="safety" role="tab" id="safety" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Защита вашего игрового аккаунта
			</Typography>
			<Typography className="text-xl mb-6">
				Ваш аккаунт может быть легко подвержен взлому.
				Если вы используете пиратскую версию игры, то тем более нужно перестраховаться,
				привязав ваш аккаунт к боту в Discord/VK/Telegram.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как привязать?
			</Typography>
			<Typography className="text-xl">
				Зайдите в игру на сервер и введите команду <CommandLine>/security</CommandLine>.
			</Typography>
			<Typography className="text-xl mb-6">
				Далее напишите нужному боту фразу, которую вы увидели после ввода команды (вы можете привязать свой
				аккаунт ко всем ботам).
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что может бот?
			</Typography>
			<Typography className="text-xl">
				Если вы привязали аккаунт к боту, то это уже хорошо.
				Каждое действие с вашим игровым аккаунтом будет комментироваться ботом вам в личные сообщения.
			</Typography>
			<Typography className="text-xl mb-6">
				Вы можете отключить уведомления от бота о вашем входе/выходе или смене пароля,
				но я не рекомендую это делать.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Cмена пароля аккаунта
			</Typography>
			<Typography className="text-xl">
				Чтобы сменить пароль от игрового аккаунта,
				введите команду <CommandLine>/changepass (текущий пароль) (новый пароль)</CommandLine>.
			</Typography>
		</ContentModule>
	)
}

const BoostsModule = () => {
	return (
		<ContentModule value="boosts" role="tab" id="boosts" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Бусты
			</Typography>
			<Typography className="text-xl mb-6">
				Бусты дают возможность быстрее зарабатывать, а также мгновенно получать опыт и единицы знаний навыков.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Где купить?
			</Typography>
			<Typography className="text-xl mb-6">
				Купить можно у мастера Модеста, либо прописать команду -
				<CommandLine>/store_boosts</CommandLine>.
			</Typography>
		</ContentModule>
	)
}

const ReportsModule = () => {
	return (
		<ContentModule value="reports" role="tab" id="reports" className="flex flex-col gap-y-4 ">
			<Typography className="text-5xl mb-8">
				Жалобы на игроков
			</Typography>
			<Typography className="text-xl mb-6">
				Заметили читера или неадекватного игрока? Пожалуйтесь на него.
				Это можно сделать в игре или в дискорде. Рассматриваются все жалобы,
				с доказательствами конечно.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как пожаловаться на игрока в игре?
			</Typography>
			<Typography className="text-xl">
				Используйте команду&nbsp;
				<CommandLine>/report (ник) (причина)</CommandLine>.
			</Typography>
			<Typography className="text-xl">
				Далее укажите доказательство в виде ссылки на скриншот
				(это может быть imgur.com/upload, dropbox.com)
			</Typography>
			<Typography className="text-xl mb-6">
				Ждите ответа от модерации.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как пожаловаться на игрока в дискорде?
			</Typography>
			<Typography className="text-xl mb-6">
				Используйте канал &quot;жалобы&quot; в категории &quot;обратная связь&quot; нашего
				<Link href="https://discord.gg/yT7xem2C9G"
					className="text-[#00cdb0] text-shadow-xl"> Discord</Link> сервера.
			</Typography>
		</ContentModule>
	)
}

const QuestsModule = () => {
	return (
		<ContentModule value="quests" role="tab" id="quests">
			<Typography className="text-5xl mb-8">
				Диалоги и квесты
			</Typography>
			<Typography className="text-xl mb-6">
				В игре множество различных персонажей, с которыми можно поговорить и даже взять задание.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Где найти персонажей?
			</Typography>
			<Typography className="text-xl mb-6">
				Персонажей легко найти, все они находятся в городе Оффенбурге (aka spawn).
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Диалоговая система
			</Typography>
			<Typography className="text-xl mb-6">
				Система диалогов очень проста.
				Управление в диалоге составляет 3 клавиши - ПКМ, CКМ (колёсико мыши) и Shift.
			</Typography>
			<Typography className="text-xl">
				ПКМ отвечает за выбор варианта ответа.
			</Typography>
			<Typography className="text-xl">
				СКМ - за передвижение между другими вариантами ответа.
			</Typography>
			<Typography className="text-xl mb-6">
				Shift - за выход из диалога.
			</Typography>
			<Typography className="text-xl mb-6">
				Обратите внимание, как только вы вступите в диалог с
				персонажем, то не сможете адекватно видеть чат сервера, так как будут отображены
				варианты ответа в диалоге.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Отслеживание прогресса заданий
			</Typography>
			<Typography className="text-xl">
				После взятия задания у персонажа, его можно отследить, введя команду&nbsp;
				<CommandLine>/story</CommandLine>.
			</Typography>
			<Typography className="text-xl mb-6">
				Также можно быстро перейти к нужному персонажу, указав его имя, например
				я хочу попасть сразу в меню персонажа Альберта, то я введу&nbsp;
				<CommandLine>/story_albert</CommandLine>.
			</Typography>
			<div className="flex items-center justify-center">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("character_menu")}
					alt="Story Menu"
					annotation="Типичное меню персонажа"
				/>
			</div>
		</ContentModule>
	)
}

const SkillsModule = () => {
	return (
		<ContentModule value="skills" role="tab" id="skills">
			<Typography className="text-5xl mb-8">
				Навыки
			</Typography>
			<Typography className="text-xl mb-6">
				Всего на сервере существует 21 навык.
				У каждого навыка разное количество умений, которые можно приобрести и прокачать. О всём ниже.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Основные понятия
			</Typography>
			<Typography className="text-xl">
				Общий уровень - уровень, который является независимым от уровней других навыков.
				Он копится при любых ваших действиях.
				Общий уровень = энергии.
			</Typography>
			<Typography className="text-xl">
				Энергия - это слоты, которые можно заполнить умением какого-либо навыка.
				При покупке умения - указано сколько он будет занимать слотов, учитывайте это!
			</Typography>
			<Typography className="text-xl">
				Общий множитель опыта - множитель добываемого вами опыта относительно общего уровня.
				Пока не изменяется, но позже можно его будет увеличивать бустами.
			</Typography>
			<Typography className="text-xl mb-6">
				Общее кол-во опыта - общее количество опыта относительно общего уровня навыков.
				Просто информирование.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Понятие навыка
			</Typography>
			<Typography className="text-xl">
				Навык имеет в себе уровень, знания и опыт. Всё взаимосвязанно.
			</Typography>
			<Typography className="text-xl">
				Уровень навыка прокачивается от количества набранного опыта.
				Опыт же увеличивается от любых ваших действий относительно навыка.
			</Typography>
			<Typography className="text-xl mb-6">
				Знания = уровню навыка. За них можно как раз-таки покупать умения соответствующего навыка.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Понятие умения
			</Typography>
			<Typography className="text-xl">
				Умение - уникальное улучшение в вашу игру.
				Умений много, каждое из которых очень хорошо вписывается в игру.
				Например: умение, которое увеличивает вашу скорость передвижения в зависимости от
				вашей длительность безостановочного бега.
			</Typography>
			<Typography className="text-xl mb-6">
				Приобретать умения можно за единицы знаний соответствующего навыка.
			</Typography>
			<div className="flex flex-col items-center gap-6 justify-center flex-wrap">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("skills_global")}
					alt="General Skill Level"
					width={360}
					annotation="Информация об общих значениях"
				/>
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("skills_skill")}
					alt="Skill Level"
					width={360}
					annotation="Информация о значениях навыка"
				/>
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("skills_skill_unique")}
					alt="Skills "
					width={360}
					annotation="Покупка умения навыка за единицы знаний"
				/>
			</div>
		</ContentModule>
	)
}

const RegionsModule = () => {
	return (
		<ContentModule value="regions" role="tab" id="regions">
			<Typography className="text-5xl mb-8">
				Регионы и области
			</Typography>
			<Typography className="text-xl mb-6">
				На сервере предлагается очень продвинутая система владения регионами.
				Налоги, области, аренда, флаги и многое другое ниже.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что такое владение регионами?
			</Typography>
			<Typography className="text-xl">
				Владение регионами - это когда ты можешь иметь 1 регион и внутри него несколько отдельных областей, с
				разными правилами, ограничениями и игроками.
			</Typography>
			<Typography className="text-xl mb-6">
				Также, можно отдавать регион в аренду другому игроку или выставлять его на продажу.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как управлять регионами?
			</Typography>
			<Typography className="text-xl mb-6">
				Регионами можно управлять с помощью удобного меню, которое можно открыть, введя команду&nbsp;
				<CommandLine>/lands</CommandLine>.
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("region_default")}
					alt="Lands General Menu"
					annotation="Обычное главное меню региона"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как создать и заприватить регион?
			</Typography>
			<Typography className="text-xl mb-6">
				Для того, чтобы заприватить регион, нужно сначала выделить территорию.
				Выделение происходит с помощью инструмента выделения, который можно получить
				введя команду <CommandLine>/selection</CommandLine>.
				После выделения территории, нужно создать регион (если у вас его нет) и прописать /claim.
				При привате региона, захватывается вся территория по высоте (от минимальной до максимальной).
				Изначально каждый игрок может иметь 4 бесплатных чанка.
				Если вы хотите заприватить огромную территорию - то сначала убедитесь, что на балансе региона лежит нужная
				сумма.
				Напомню, стоимость привата 1 чанка равна 1.2 единиц харизмы.
			</Typography>
			<div className="flex items-center gap-4 justify-center mb-6">
				<ImageAnnotation
					source={REGIONS_FOLDER_ITEM("region_select_start")}
					alt="Selection 1"
					annotation="Выделение территории: старт"
				/>
				<ImageAnnotation
					source={REGIONS_FOLDER_ITEM("region_select_finish")}
					alt="Selection 2"
					annotation="Выделение территории: финал"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Что такое области и как их создать?
			</Typography>
			<Typography className="text-xl">
				Области - это отдельные участки внутри региона, которые можно создать и добавить туда игроков,
				менять флаги мира.
			</Typography>
			<Typography className="text-xl">
				Для определения области сначала нужно выделить территорию&nbsp;
				<CommandLine>/selection</CommandLine>,
				а далее прописать команду&nbsp;
				<CommandLine>/lands assign (название)</CommandLine>.
			</Typography>
			<Typography className="text-xl mb-6">
				Когда область создана, вы можете добавить туда игрока, назначить отдельные флаги мира.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Управление игроками
			</Typography>
			<Typography className="text-xl">
				Игрока можно добавить в регион, введя команду&nbsp;
				<CommandLine>/lands trust (ник) (опционально: регион)</CommandLine>.
				Удалить из региона -&nbsp;
				<CommandLine>/lands untrust (ник) (опционально: регион)</CommandLine>
			</Typography>
			<Typography className="text-xl mb-6">
				Игрокам можно менять роль, а также опционально блокировать или разблокировать относительно региона.
				Блокировка запрещает игроку входить на территорию региона и как-то
				взаимодействовать с ним.
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("region_members")}
					alt="Members Menu"
					annotation="Меню управления игроками"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Роли
			</Typography>
			<Typography className="text-xl">
				К каждому игроку, который состоит в регионе применяется роль.
				У обычного только что добавленного игрока в регион, роль - Участник.
			</Typography>
			<Typography className="text-xl">
				Существуют следующие роли: посетитель, участник, заместитель, владелец. Ниже о каждой роли:
			</Typography>
			<div className="flex flex-col items-center justify-center gap-6 flex-wrap mb-6">
				<ImageAnnotation
					source={OTHER_FOLDER_ITEM("guest_role")}
					alt="Visitor Role"
					width={490}
					height={560}
					annotation="Роль: Посетитель"
				/>
				<ImageAnnotation
					source={OTHER_FOLDER_ITEM("member_role")}
					alt="Member Role"
					width={490}
					height={560}
					annotation="Роль: Участник"
				/>
				<ImageAnnotation
					source={OTHER_FOLDER_ITEM("deputy_role")}
					alt="Deputy Role"
					width={490}
					height={560}
					annotation="Роль: Заместитель"
				/>
				<ImageAnnotation
					source={OTHER_FOLDER_ITEM("creator_role")}
					alt="Creator Role"
					width={490}
					height={560}
					annotation="Роль: Владелец"
				/>
			</div>
			<Typography className="text-xl">
				Каждая роль имеет ряд возможностей и ограничений (кроме владельца).
			</Typography>
			<Typography className="text-xl">
				Можно создать свои роли, игроку можно создать до 18 ролей.
				А можно и редактировать роли по умолчанию.
			</Typography>
			<Typography className="text-xl mb-6">
				Кастомные роли можно создавать с роли заместителя и выше (это может менять владелец).
				Кастомные роли можно настраивать под свой регион (менять флаги, отключать налоги для участников с этими
				ролями и т.д).
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("region_roles")}
					alt="Roles Menu"
					annotation="Меню управления ролями"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Налоги
			</Typography>
			<Typography className="text-xl">
				Налоги выплачивает каждый регион раз в сутки.
				Обычно сумма налога зависит от размера региона, по такой логике: чем больше чанков во владении - тем
				больше плата.
				За каждый чанк требуется платить сумму равную 0.2 единиц харизмы.
			</Typography>
			<Typography className="text-xl">
				Налоги существуют и для участников региона.
				Каждый участник выплачивает фиксированную сумму, находясь в регионе, где это правило включено (выплата
				налогов).
				Владелец или заместитель может выключить это правило и участники могут не платить налоги,
				но сумму будет пополнять владелец или любой другой участник со своего желания.
			</Typography>
			<Typography className="text-xl mb-6">
				Чтобы пополнить баланс региона, используйте команду&nbsp;
				<CommandLine>/lands deposit (сумма)</CommandLine>,
				а чтобы снять - <CommandLine>/lands withdraw (сумма)</CommandLine>.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Флаги региона
			</Typography>
			<Typography className="text-xl">
				Флаги региона - это игровые правила, относительно региона. Например: спавн мобов или пвп.
				Настроить можно через меню, которое открывается опять же командой&nbsp;
				<CommandLine>/lands</CommandLine>.
			</Typography>
			<Typography className="text-xl">
				Опять же, не все флаги может редактировать обычный игрок!
				Все флаги доступны привилегии &quot;Аутентик&quot; и выше.
			</Typography>
			<div className="flex items-center justify-center">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("region_flags")}
					alt="Flags Menu"
					annotation="Меню управления флагами"
				/>
			</div>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Уровни региона
			</Typography>
			<Typography className="text-xl">
				Существует 4 уровня региона: поселение, деревня, развивающийся город и город.
				Каждый уровень открывает новые возможности и увеличивает лимит участников и баланс региона.
				Чтобы достигать новых уровней, региону нужно выполнить определенные условия.
			</Typography>
			<Typography className="text-xl mb-6">
				Информацию о следующем уровне региона и его условиях можно опять же просмотреть
				через главное меню управления регионами.
			</Typography>
			<div className="flex items-center justify-center mb-6">
				<ImageAnnotation
					source={MENUS_FOLDER_ITEM("region_levels")}
					alt="Levels Menu"
					annotation="Меню просмотра уровней региона"
				/>
			</div>
		</ContentModule>
	)
}

const ReferalsModule = () => {
	return (
		<ContentModule value="referals" role="tab" id="referal">
			<Typography className="text-5xl mb-8">
				Реферальная система
			</Typography>
			<Typography className="text-xl mb-6">
				Игроки могут получать награды за приглашение друзей в игру.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Условия
			</Typography>
			<Typography className="text-xl mb-6">
				Пригласивший игрок должен провести в игре не менее 6 часов, а
				приглашённый игрок должен провести в игре не менее 3 часов.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Награды
			</Typography>
			<Typography className="text-xl">
				Пригласивший игрок: 60 харизмы и 3 белкоина
			</Typography>
			<Typography className="text-xl mb-6">
				Приглашённый игрок: 30 харизмы и 1 белкоин
			</Typography>
			<Typography className="text-xl">
				Отследить прогресс выполнения реферальных условий можно в личном кабинете.
			</Typography>
		</ContentModule>
	)
}

const SkinModule = () => {
	return (
		<ContentModule value="skin" role="tab" id="skin">
			<Typography className="text-5xl mb-8">
				Система скинов
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Формирование скина
			</Typography>
			<Typography className="text-xl">
				В зависимости от типа аккаунта игрок получает определённый скин:
			</Typography>
			<Typography className="text-xl">
				Лицензионный аккаунт – скин соответствует тому, который установлен в официальном профиле.
			</Typography>
			<Typography className="text-xl mb-6">
				Пиратский аккаунт – по умолчанию используется скин Стива, но его можно изменить в игре.
			</Typography>
			<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
				Как изменить скин
			</Typography>
			<Typography className="text-xl mb-6">
				В игре изменить скин можно разными способами: указать ссылку на скин, либо указать никнейм игрока, скин которого вам нужен.
			</Typography>
			<Typography className="text-xl">
				Команда для изменения скина через никнейм: <CommandLine>/skin set [никнейм]</CommandLine>
			</Typography>
			<Typography className="text-xl mb-6">
				Команда для изменения скина через ссылку: <CommandLine>/skin url [ссылка] [тип скина]</CommandLine>
			</Typography>
			<Typography className="text-xl">
				Доступные сайты для загрузки скина: imgur, google drive, discord, textures minecraft net
			</Typography>
			<Typography className="text-xl">
				Типы скинов: SLIM, CLASSIC
			</Typography>
		</ContentModule>
	)
}

const useWikiNavigation = () => {
	const searchParams = usePageContext().urlParsed.search
	const params = new URLSearchParams(searchParams.toString());

	const setTab = (value: string) => {
		if (!params.has("tab")) {
			params.append("tab", value)
		} else {
			params.set("tab", value)
		}

		navigate(`/wiki?tab=${value}`)
	}

	const initTab = () => {
		if (params.get("tab") !== null) {
			setTab(params.get("tab")!)
		};
	}

	return { setTab, initTab, param: searchParams["tab"] }
}

const Content = () => {
	return (
		<div
			className="flex flex-col rounded-2xl p-4 w-full overflow-hidden lg:w-auto border border-neutral-400"
		>
			<GeneralModule />
			<ProfileModule />
			<EconomicModule />
			<JobsModule />
			<ReputationModule />
			<PetsModule />
			<MetroModule />
			<MobsModule />
			<ArmorModule />
			<SafetyModule />
			<BoostsModule />
			<ReportsModule />
			<QuestsModule />
			<SkillsModule />
			<RegionsModule />
			<ReferalsModule />
			<SkinModule />
		</div>
	)
}

export const WikiContent = () => {
	const { initTab, setTab, param } = useWikiNavigation()

	useEffect(() => {
		initTab()
	}, [])

	return (
		<Tabs.Root
			value={param || "general"}
			onValueChange={e => setTab(e.value)}
			defaultValue="general"
			className="flex flex-col lg:flex-row items-start justify-between bg-transparent w-full gap-x-4"
		>
			<WikiNavigationBar />
			<Content />
			<Dialog.Root>
				<Dialog.Trigger className="xl:hidden fixed bottom-6 right-6 z-30 flex px-2 py-1 rounded-md
            bg-[#553C7D] border border-neutral-700">
					<Typography className="text-md">
						Навигация
					</Typography>
				</Dialog.Trigger>
				<Portal>
					<Dialog.Backdrop />
					<Dialog.Positioner>
						<Dialog.Content className="xl:hidden bg-transparent border-none p-0 max-w-4xl max-h-[68%] overflow-y-auto">
							<Tabs.List className="flex flex-col p-0 rounded-xl w-full items-start">
								<div className="border border-neutral-400 flex flex-col gap-4 rounded-2xl gap-y-12 h-full">
									<div className="flex flex-col">
										<Typography className="text-xl mb-4">
											Общая информация
										</Typography>
										<div className="flex flex-col gap-y-2">
											<div className="flex flex-row justify-between items-center group cursor-pointer">
												<Tabs.Trigger value="general">
													<Typography className="text-xl">
														Основной раздел
													</Typography>
												</Tabs.Trigger>
											</div>
											<Accordion.Root collapsible>
												<Accordion.Item value="aspects">
													<Accordion.ItemTrigger className="py-0 my-0 group">
														<Typography className="text-xl">
															Аспекты игры
														</Typography>
													</Accordion.ItemTrigger>
													<Accordion.ItemContent>
														{WIKI_HEADERS.map((item) => (
															item.aspect?.map((item,
																idx) => (
																<div key={idx} className="group cursor-pointer">
																	<Dialog.CloseTrigger asChild>
																		<Tabs.Trigger value={item.value}>
																			<Typography className="text-base">
																				&nbsp;&nbsp;{item.title}
																			</Typography>
																		</Tabs.Trigger>
																	</Dialog.CloseTrigger>
																</div>
															))
														))}
													</Accordion.ItemContent>
												</Accordion.Item>
											</Accordion.Root>
											{WIKI_HEADERS.map((item) => (
												item.links?.map((item,
													idx) => (
													<div key={idx} className="flex flex-row items-center justify-between group cursor-pointer">
														<Dialog.CloseTrigger asChild>
															{item.isTab ? (
																<Tabs.Trigger value={item.value}>
																	<Typography className="text-xl">
																		{item.title}
																	</Typography>
																</Tabs.Trigger>
															) : (
																<div onClick={() => navigate(`${item.value}`)}>
																	<Typography className="text-xl">
																		{item.title}
																	</Typography>
																</div>
															)}
														</Dialog.CloseTrigger>
													</div>
												))
											))}
										</div>
									</div>
									<div className="flex flex-col">
										<Typography className="text-xl mb-4">
											Прочее
										</Typography>
										<Link href="/wiki/modpack" className="group">
											<Typography className="text-base">
												Сборки модов
											</Typography>
										</Link>
									</div>
								</div>
							</Tabs.List>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</Tabs.Root>
	)
}