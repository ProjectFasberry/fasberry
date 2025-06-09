export type ContactsListProps = {
	name: string,
	href: string,
	content: {
		pluses: Array<string>,
		minuses: Array<string>
	}
}

export const CONTACTS_LIST: ContactsListProps[] = [
	{
		name: "Дискорд",
		href: "https://discord.gg/vnqfVX4frH",
		content: {
			pluses: [
				"общение напрямую с челами в чатике",
				"самым первым узнаёшь новости о проекте",
				"я ЛИЧНО скажу тебе СПАСИБО на сервере",
				"ты 1% счастливчиков, кто выполняет просьбы, прочитав их",
			],
			minuses: [ "самым первым узнавать новости ты можешь и в телеге проекта" ],
		}
	},
	{
		name: "Телеграмм",
		href: "https://t.me/fasberry",
		content: {
			pluses: [
				"самым первым узнаёшь новости о проекте",
				"я ЛИЧНО скажу тебе СПАСИБО на сервере",
				"ты 1% счастливчиков, кто выполняет просьбы, прочитав их",
			],
			minuses: [
				"скудная активность в комментариях (100%)",
				"самым первым узнавать новости ты можешь и в дискорде проекта",
			],
		}
	},
];