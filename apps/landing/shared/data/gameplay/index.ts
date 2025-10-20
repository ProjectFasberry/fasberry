import { GAMEPLAY_FOLDER_ITEM } from "../folders";

export type GameplayItemType = {
	name: string,
	description: string,
	image: string
}

export const GAMEPLAY: GameplayItemType[] = [
	{
		name: "◎ Развитая система экономики",
		description:
			"Несколько валют + система репутации, которая даёт тебе дополнительные возможности в игре.",
		image: GAMEPLAY_FOLDER_ITEM("custom_wallets")
	},
	{
		name: "★ Питомцы",
		description:
			"Два вида питомцев со своей историей, способностями, характеристиками и поведением.",
		image: GAMEPLAY_FOLDER_ITEM("pets"),
	},
	{
		name: "☀ Кастомные вещи",
		description:
			"Новые наборы брони, клинки и многое другое.",
		image: GAMEPLAY_FOLDER_ITEM("custom_items"),
	},
];