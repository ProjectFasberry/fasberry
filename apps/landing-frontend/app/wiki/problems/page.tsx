import { MainLayoutPage } from "#components/layout/default/main-layout";
import { Typography } from "@repo/landing-ui/src/typography";

export const metadata = {
	title: "Технические проблемы"
}

export default async function WikiProlemsPage() {
	return (
		<MainLayoutPage>
			<div className="flex flex-col gap-y-4 ">
				<Typography className="text-5xl mb-8">
					Технические проблемы
				</Typography>
				<Typography size="xl" className="mb-6">
					Бывает такое, что возникает какая-либо проблема.
					На нашем сервере - это ресурспак.
				</Typography>
				<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
					Ресурспак не включается
				</Typography>
				<Typography size="xl" className="mb-6">
					Попробуйте перезайти на сервер. Если всё равно не активируется,
					то включите опцию &quot;Наборы ресурсов&quot; перед входом на сервер.
				</Typography>
				<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
					Везде белые прямоугольники
				</Typography>
				<Typography size="xl" className="mb-6">
					Это означает, что у вас не применился ресурспак или он
					применился некорректно относительно ваших настроек языка. Одним из решений будет выключить опцию
					&quot;Шрифт Unicode&quot; в настройках Языка майнкрафта.
				</Typography>
				<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
					Долго грузится ресурспак
				</Typography>
				<Typography size="xl" className="mb-6">
					Ресурспак сервера весит относительно немного, так что не должно быть веских причин его
					не загружать постоянно (при входе/выходе). Если у вас возникают проблемы с загрузкой РП,
					то проверьте скорость интернета и пинга. А также перезагрузите клиент игры.
				</Typography>
				<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
					На сервере не используется PlasmoVoice
				</Typography>
				<Typography size="xl" className="mb-6">
					Нет, на сервере используется PlasmoVoice, это ошибка на клиенте, то есть у вас.
					Попробуйте перезайти на сервер несколько раз до включения мода. Это не наша ошибка, а мода.
				</Typography>
				<Typography variant="block_subtitle" shadow="xl" className="text-project-color">
					Лагает на спавне
				</Typography>
				<Typography size="xl" className="mb-6">
					Снизьте дальность прорисовки теней, если у вас малый фпс на спавне.
					А также уменьшите дальность прорисовки, если она у вас очень большая.
				</Typography>
			</div>
		</MainLayoutPage>
	)
}