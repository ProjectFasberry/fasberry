import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Typography } from "@repo/ui/typography";
import { IconArrowRight } from "@tabler/icons-react";
import { News } from "@/shared/components/app/news/components/news";
import { Intro } from "@/shared/components/app/intro/components/intro";
import { Events } from "@/shared/components/app/events/components/events";

const CONTACTS = [
  {
    title: "Telegram",
    value: "tg",
    img: "https://cristalix.gg/content/icons/tg.svg",
    color: "bg-[#007CBD]",
    href: "https://t.me/fasberry",
  },
  {
    title: "VK",
    value: "vk",
    img: "https://cristalix.gg/content/icons/vk.svg",
    color: "bg-[#0b5aba]",
    href: "https://vk.com/fasberry",
  },
  {
    title: "Discord",
    value: "ds",
    img: "https://cristalix.gg/content/icons/discord.svg",
    color: "bg-[#5865F2]",
    href: "https://discord.gg/X4x6Unj89g",
  },
  {
    title: "X",
    value: "x",
    img: "https://cristalix.gg/content/icons/x.svg",
    color: "bg-black",
    href: "https://x.com/fasberry",
  },
]

const Contacts = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-auto gap-2 sm:gap-4 w-full">
      {CONTACTS.map((item, idx) => (
        <a
          href={item.href}
          key={idx}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center justify-between p-4 group rounded-lg ${item.color}`}
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <img src={item.img} alt="TG" width={36} height={36} />
            <Typography className="truncate font-semibold text-lg lg:text-xl">
              {item.title}
            </Typography>
          </div>
          <IconArrowRight size={36} className="duration-150 -rotate-45 group-hover:rotate-0" />
        </a>
      ))}
    </div>
  )
}

export default function IndexPage() {
  return (
    <MainWrapperPage>
      <div className='flex flex-col gap-8 w-full h-full'>
        <Intro />
        <News />
        <Events />
        <Contacts />
      </div>
    </MainWrapperPage>
  )
}