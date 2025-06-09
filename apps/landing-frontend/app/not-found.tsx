import { Typography } from "@repo/landing-ui/src/typography";
import { Button } from "@repo/landing-ui/src/button";
import Link from "next/link";

export const metadata = {
	title: "Ничего не найдено :/"
}

export default async function NotFoundPage() {
	return (
		<div
			id="not-found"
			className="flex min-h-screen justify-center items-center px-8"
			style={{
				backgroundImage: 'url("/images/static/dirt.webp")'
			}}
		>
			<div className="flex flex-col items-center gap-y-2">
				<Typography className="text-neutral-400 text-base md:text-xl font-normal">
					Отключено
				</Typography>
				<Typography className="text-white text-base md:text-xl text-center font-normal">
					Не удалось найти нужный ресурс.
				</Typography>
				<Link href="/">
					<Button
						className="w-full md:w-max mt-6 raised-slot-button text-center text-neutral-800 text-base md:text-xl py-1 px-4 md:px-6"
					>
						Вернуться в безопасное место
					</Button>
				</Link>
			</div>
		</div>
	)
}