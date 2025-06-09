import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Overlay } from "@repo/landing-ui/src/overlay";
import { WrapperTitle } from "@repo/landing-ui/src/wrapper-title";
import { Typography } from "@repo/landing-ui/src/typography";
import { Block } from "@repo/landing-ui/src/block";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/landing-ui/src/button";
import { MINECRAFT_SITE_DOMAIN } from "@repo/shared/constants/origin-list";

export const metadata = {
	title: "Поддержка",
	description:
		`Помогите развитию проекта Fasberry, поддержав нас! Ваш вклад пойдет на развитие серверов, 
		улучшение игрового опыта и создание уникального контента для игроков.`,
	keywords: [
		"Fasberry",
		"поддержка Fasberry",
		"помощь проекту",
		"развитие серверов Fasberry",
		"донат Fasberry",
		"поддержка сообщества",
		"разработка Fasberry",
	],
	robots: "index, follow",
	canonical: `${MINECRAFT_SITE_DOMAIN}/support`,
	openGraph: {
		siteName: "Поддержка проекта Fasberry",
		title: "Поддержка проекта Fasberry",
		description:
			"Станьте частью нашего проекта Fasberry, поддержав нас! Ваши пожертвования помогают развивать сервера и создавать новый контент.",
		url: `${MINECRAFT_SITE_DOMAIN}/support`,
		type: "website",
		images: [
			{
				url: "https://mc.fasberry.su/images/community/dragon_dead.webp",
				alt: "Поддержка Fasberry проекта",
				width: 1200,
				height: 630,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Поддержка Fasberry проекта",
		description:
			"Присоединяйтесь к сообществу Fasberry и помогайте нам развиваться! Ваша поддержка имеет значение.",
		images: ["https://mc.fasberry.su/images/community/dragon_dead.webp"],
	},
}

export default async function SupportPage() {
	return (
		<MainLayoutPage variant="with_section">
			<div
				className="full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom bg-no-repeat bg-cover
			 bg-[url('/images/backgrounds/support_background.png')]"
			>
				<Overlay variant="default" />
				<WrapperTitle>
					<div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
						<div className="flex flex-col gap-1 w-full lg:max-w-3xl">
							<Typography position="left" shadow="xl" className="text-5xl lg:text-6xl text-gold mb-2">
								Поддержка проекта
							</Typography>
							<Typography position="left" text_color="white" className="text-2xl md:text-3xl">
								Здесь можно узнать о способах поддержки развития проекта. Это не связано с донатом!
							</Typography>
						</div>
						<Link href="#support-list">
							<Button
								size="default"
								variant="pageLink"
								className="hover:bg-[#86600d] rounded-xl border border-[#86600d] bg-[#724e11]"
							>
								<Typography text_color="white" className="font-bold text-xl">
									<span className="inline-block duration-150 group-hover:duration-150">
										○
									</span>
									&nbsp;К поддержке
								</Typography>
							</Button>
						</Link>
					</div>
				</WrapperTitle>
			</div>
			<div id="support-list" className="full-screen-section flex flex-col justify-center items-center relative py-24 lg:py-36">
				<div className="flex flex-col justify-center gap-y-6 w-[90%] mx-auto">
					<div className="flex flex-col justify-center items-center mb-6">
						<Typography
							variant="block_title"
							className="text-black dark:text-white"
						>
							Поддержка проекта
						</Typography>
						<Typography
							size="xl"
							position="center"
							className="text-dark-red dark:text-gold"
						>
							ниже представлены пока что основные способы помочь проекту. Спасибо!
						</Typography>
					</div>
					<Block
						blockItem
						rounded="big"
						className="flex flex-col md:flex-row overflow-hidden md:items-center items-start gap-x-6 gap-y-4 w-full"
					>
						<Image
							width={566}
							height={566}
							alt="Monitoring Steve"
							className="md:h-[322px] xl:h-[352px] w-fit rounded-[8px]"
							src="/images/support/steve.webp"
						/>
						<div className="flex flex-col items-start p-2 gap-y-2 md:p-0 lg:w-1/2 w-full">
							<h1 className="text-shadow-md text-xl lg:text-2xl xl:text-4xl 2xl:text-6xl text-fuchsia-400 mb-2">
								Мониторинг
							</h1>
							<div className="flex flex-col">
								<Typography
									text_color="adaptiveWhiteBlack"
									variant="block_paragraph"
								>
									Я лично выставил сервер на несколько сайтов-мониторингов.
								</Typography>
								<Typography
									text_color="adaptiveWhiteBlack"
									variant="block_paragraph"
								>
									&quot;Зачем ты это сделал?&quot; - задашь ты мне вопрос
								</Typography>
								<Typography
									text_color="adaptiveWhiteBlack"
									variant="block_paragraph"
								>
									Ну, во-первых, это халявный трафик, хоть и малый.
								</Typography>
								<Typography
									text_color="adaptiveWhiteBlack"
									variant="block_paragraph"
								>
									А во-вторых, тебе же легко просто проголосовать за сервер, да?
								</Typography>
							</div>
							<div className="flex flex-col mt-4">
								<Link target="_blank" href="https://hotmc.ru/vote-259308">
									<div className="flex justify-between items-center button px-6 py-1">
										<Typography text_color="white" size="xl">
											Проголосовать
										</Typography>
									</div>
								</Link>
							</div>
						</div>
					</Block>
					<Block
						blockItem
						rounded="big"
						className="flex flex-col md:flex-row overflow-hidden md:items-center items-start gap-x-6 gap-y-4 w-full"
					>
						<Image
							width={512}
							height={512}
							className="md:w-[322px] md:h-[322px] xl:w-[352px] xl:h-[352px] rounded-[8px]"
							src="/images/support/alex.webp"
							alt="share Fasberry Project"
						/>
						<div className="flex flex-col items-start p-2 gap-y-2 md:p-0 lg:w-1/2 w-full">
							<h1 className='text-shadow-md text-xl lg:text-2xl xl:text-4xl 2xl:text-6xl text-fuchsia-400 mb-4'>
								Знакомый знакомому
							</h1>
							<Typography
								text_color="adaptiveWhiteBlack"
								variant="block_paragraph"
							>
								Расскажи об этом сервере своим друзьям, может знакомым, зайдите вечерком, поиграйте. Если зайдет, то
								возможно вы станете легендами.
								Я думаю хороший обмен.
							</Typography>
							<div className="flex flex-col lg:flex-row justify-start w-full gap-x-4 mt-4 gap-y-2">
								<Link href="https://telegram.me/share/url?url=https%3A%2F%2Fmc.fasberry.su&text=" target="_blank">
									<div className="flex justify-between items-center button px-4 py-1">
										<Typography text_color="white" size="xl">
											Поделиться в телеграмме
										</Typography>
									</div>
								</Link>
								<Link href="https://vk.com/share.php?url=https%3A%2F%2Fmc.fasberry.su&title=" target="_blank">
									<div className="flex justify-between items-center button px-4 py-1">
										<Typography text_color="white" size="xl">
											Поделиться во вконтакте
										</Typography>
									</div>
								</Link>
							</div>
						</div>
					</Block>
				</div>
			</div>
		</MainLayoutPage>
	)
}