import { IconBrandDiscordFilled, IconBrandTelegram } from "@tabler/icons-react"
import { Link } from "../../../config/link"
import { Typography } from "@repo/ui/typography"
import { CONTACTS } from "../../../../consts/contacts"
import { LANDING_URL } from "@/shared/env"

const telegramHref = CONTACTS.find(t => t.value === 'tg')?.href as string
const discordHref = CONTACTS.find(t => t.value === 'ds')?.href as string

export const Footer = () => {
  return (
    <div className="flex items-center justify-center w-full bg-gradient-to-br pb-8
          from-green-700/40 via-green-800/50 to-green-900/40 h-full sm:h-40 sm:min-h-40 border-t p-3 sm:p-4 border-green-500/20 sm:backdrop-blur-md">
      <div className="flex flex-col items-center justify-center responsive h-full gap-4">
        <div
          className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start w-full h-full"
        >
          <div className="flex flex-col gap-4 items-start h-full w-full sm:w-1/3">
            <Link href="/" aria-label="Перейти на главную" className="flex select-none items-end gap-2">
              <img src="/favicon.ico" draggable={false} width={36} height={36} alt="" />
              <Typography className="text-2xl font-semibold">
                Fasberry
              </Typography>
            </Link>
            <div className="flex items-center *:duration-150 gap-2">
              <Link
                href={discordHref}
                aria-label="Дискорд"
                className="flex items-center justify-center p-2 hover:bg-white/20 rounded-full"
              >
                <IconBrandDiscordFilled size={18} />
              </Link>
              <Link
                href={telegramHref}
                aria-label="Телеграм"
                className="flex items-center justify-center p-2 hover:bg-white/20 rounded-full"
              >
                <IconBrandTelegram size={18} />
              </Link>
            </div>
          </div>
          <div className="grid grid-rows-3 grid-cols-1 sm:grid-rows-none sm:grid-cols-3 gap-2 w-full sm:w-2/3">
            <div className="flex flex-col min-w-0 gap-2 *:w-fit">
              <Typography className="font-semibold truncate">
                О проекте
              </Typography>
              <div className="flex flex-col gap-1 min-w-0 *:truncate">
                <Link href="/news">
                  Новости
                </Link>
              </div>
            </div>
            <div className="flex flex-col min-w-0 gap-2 *:w-fit">
              <Typography className="font-semibold truncate">
                Информация
              </Typography>
              <div className="flex flex-col gap-1 min-w-0 *:truncate">
                <Link href={`${LANDING_URL}/info/contacts`}>
                  Контакты
                </Link>
                <Link href={`${LANDING_URL}/info/privacy`}>
                  Конфиденциальность
                </Link>
              </div>
            </div>
            <div className="flex flex-col min-w-0 gap-2 *:w-fit">
              <Typography className="font-semibold truncate">
                Ресурсы
              </Typography>
              <div className="flex flex-col gap-1 min-w-0 *:truncate">
                <Link href={`${LANDING_URL}/status`}>
                  Статус
                </Link>
                <Link href={`${LANDING_URL}/wiki`}>
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Typography className="text-neutral-400 text-sm truncate text-wrap">
          НЕ ЯВЛЯЕТСЯ ОФИЦИАЛЬНЫМ СЕРВИСОМ MINECRAFT. НЕ ОДОБРЕНО И НЕ СВЯЗАНО С MOJANG ИЛИ MICROSOFT.
        </Typography>
      </div>
    </div>
  )
}