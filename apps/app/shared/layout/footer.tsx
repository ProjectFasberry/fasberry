import { IconBrandDiscordFilled, IconBrandTelegram } from "@tabler/icons-react"
import { Link } from "../components/config/link"
import { Typography } from "@repo/ui/typography"
import { CONTACTS } from "../consts/contacts"

const telegramHref = CONTACTS.find(t => t.value === 'tg')?.href as string
const discordHref = CONTACTS.find(t => t.value === 'ds')?.href as string

export const Footer = () => {
  return (
    <div className="flex items-center justify-center w-full pb-2">
      <div
        className="flex justify-between items-center responsive h-16 bg-gradient-to-br 
          from-green-600/40 to-green-700/40 border border-green-500/20 sm:backdrop-blur-md rounded-lg p-3 sm:p-4"
      >
        <div className="flex select-none items-center gap-2">
          <img src="/favicon.ico" draggable={false} width={36} height={36} alt="" />
          <Typography className="text-xl font-semibold">
            Fasberry
          </Typography>
        </div>
        <div className="flex items-center *:duration-150 gap-2">
          <Link
            href={discordHref}
            aria-label="Дискорд"
            className="flex items-center justify-center p-2 hover:bg-white/20 rounded-full"
          >
            <IconBrandDiscordFilled size={26} />
          </Link>
          <Link
            href={telegramHref}
            aria-label="Телеграм"
            className="flex items-center justify-center p-2 hover:bg-white/20 rounded-full"
          >
            <IconBrandTelegram size={26} />
          </Link>
        </div>
      </div>
    </div>
  )
}