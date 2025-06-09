import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from "@repo/landing-ui/src/typography";
import { MAIL_FASBERRY_SUPPORT, TELEGRAM_CHANNEL_LINK, VK_GROUP_LINK } from "@repo/shared/wiki//data/configs";
import Link from "next/link";

export default async function InfoContactsPage() {
	return (
		<MainLayoutPage variant="with_section">
			<div
				id="contacts-n-feedback"
				className="flex flex-col min-h-screen responsive mx-auto py-36 gap-y-6"
			>
				<Typography className="text-black dark:text-white text-3xl">
					Контакты
				</Typography>
				<div className="flex flex-col gap-y-8 rounded-[8px]">
					<div
						className="flex flex-col gap-y-4 border-2 border-[#454545] hover:duration-300 duration-300 rounded-[8px] p-4">
						<Typography text_color="adaptiveWhiteBlack" className="text-xl">
							Социальные сети и мессенджеры
						</Typography>
						<div className="flex flex-col text-white text- md lg:text-lg gap-y-4">
							<Typography text_color="adaptiveWhiteBlack">Группа VK:&nbsp;
								<Link href='https://vk.com/fasberry' target="_blank">
									{VK_GROUP_LINK}
								</Link>
							</Typography>
							<Typography text_color="adaptiveWhiteBlack">Канал в Telegram:&nbsp;
								<Link href='https://t.me/fasberry' target="_blank">
									{TELEGRAM_CHANNEL_LINK}
								</Link>
							</Typography>
						</div>
					</div>
					<div
						className="flex flex-col gap-y-4 border-2 text-md lg:text-lg border-[#454545] hover:duration-300 duration-300 rounded-[8px] p-4">
						<Typography text_color="adaptiveWhiteBlack" className="text-xl">
							Электронная почта
						</Typography>
						<div className="flex flex-col gap-y-4">
							<a
								href={`mailto:${MAIL_FASBERRY_SUPPORT}`}
								target="_blank"
							>
								<Typography text_color="adaptiveWhiteBlack">
									{MAIL_FASBERRY_SUPPORT}
								</Typography>
							</a>
						</div>
					</div>
				</div>
			</div>
		</MainLayoutPage>
	)
}