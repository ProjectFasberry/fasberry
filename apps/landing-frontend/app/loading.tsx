import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from "@repo/landing-ui/src/typography";

export default async function Loading() {
	return (
		<MainLayoutPage variant="with_section">
			<div
				className="bg-right lg:bg-center"
				style={{ backgroundImage: `url("/images/static/dirt.webp")` }}
			>
				<div className="flex flex-col gap-x-12 gap-y-4 items-center justify-center w-full min-h-screen">
					<Typography className="text-white">
						Загрузка уровня
					</Typography>
					<Typography className="text-white">
						Все уже почти готово...
					</Typography>
				</div>
			</div>
		</MainLayoutPage>
	)
}