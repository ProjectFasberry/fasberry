type MainHeaderDetails = {
  name: string,
  href: string | null
}

export type MainHeaderType = MainHeaderDetails & Partial<{
  childs: MainHeaderDetails[]
}>

export const MAIN_HEADER: MainHeaderType[] = [
  { name: "Главная", href: "/", },
  { name: "Правила", href: "/rules", },
  { name: "Поддержка", href: "/support", },
  { name: "Галерея", href: "/gallery", },
  {
    name: "Игра",
    childs: [
      // { name: "Карта мира", href: "https://map.fasberry.su", },
      { name: "Вики", href: "/wiki", },
      { name: "Модпак", href: "/wiki/modpack", },
    ],
    href: null
  },
];

export const WIKI_HEADERS = [
  {
    aspect: [
      { title: "профиль", value: "profile", },
      { title: "регионы", value: "regions", },
      { title: "квесты", value: "quests", },
      { title: "экономика", value: "economic", },
      // { title: "кланы", value: "clans", },
      { title: "работы", value: "jobs", },
      { title: "бусты", value: "boosts", },
      { title: "репутация", value: "reputation", },
      { title: "питомцы", value: "pets", },
      { title: "новые мобы", value: "mobs", },
      { title: "новая броня", value: "armor", },
      { title: "реферальная система", value: "referals", },
      { title: "скин", value: "skin" }
    ],
  },
  {
    links: [
      { isTab: true, title: "Защита аккаунта", value: "safety", },
      { isTab: true, title: "Жалобы на игроков", value: "reports", },
      // { isTab: false, title: "Тех. проблемы", value: "wiki/problems", },
      // { isTab: false, title: "Донат", value: "/shop", },
    ],
  },
  // {
  //   servers: [
  //     { title: "Bisquite Survival", value: "server-bisquite", },
  //     { title: "Muffin RP", value: "server-muffin", },
  //   ],
  // },
];

export const MAIL_FASBERRY_SUPPORT = "fasberrysu@gmail.com"
export const VK_GROUP_LINK = "https://vk.com/fasberry";
export const TELEGRAM_CHANNEL_LINK = "https://t.me/mc_fasberry";