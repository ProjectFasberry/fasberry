export const DONATE_GROUPS = {
  default: "игрок",
  arkhont: "архонт",
  helper: "хелпер",
  loyal: "лоял",
  authentic: "аутентик",
  dev: "разработчик",
  moder: "модератор",
} as const;

export const DONATE_TITLE: Record<keyof typeof DONATE_GROUPS, string> = {
  "arkhont": "Архонт",
  "authentic": "Аутентик",
  "loyal": "Лоял",
  "default": "Игрок",
  "helper": "Хелпер",
  "dev": "Разработчик",
  "moder": "Модератор",
} as const;