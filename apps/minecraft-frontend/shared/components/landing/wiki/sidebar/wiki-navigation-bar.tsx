import { WIKI_HEADERS } from "@repo/shared/wiki/data/configs"
import { navigate } from "vike/client/router";
import { Accordion, Tabs } from "@ark-ui/react";
import { Link } from "@/shared/components/config/Link";
import { Typography } from "@/shared/ui/typography";

export const WikiNavigationBar = () => {
  const handlePush = (value: string) => {
    navigate(value)
  }

  return (
    <Tabs.List className="hidden xl:flex flex-col p-0 rounded-xl w-full xl:w-[30%] items-start sticky top-0">
      <div className="flex flex-col p-4 border border-neutral-400 rounded-xl gap-y-12 h-full">
        <div className="flex flex-col gap-y-2">
          <Typography className="text-3xl">
            Общая информация
          </Typography>
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row justify-between items-center group cursor-pointer">
              <Tabs.Trigger value="general">
                <Typography className="text-xl">
                  Основной раздел
                </Typography>
              </Tabs.Trigger>
            </div>
            <Accordion.Root collapsible defaultValue={["aspects"]}>
              <Accordion.Item value="aspects">
                <Accordion.ItemTrigger className="py-0 my-0 group">
                  <Typography className="text-xl">
                    Аспекты игры
                  </Typography>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  {WIKI_HEADERS.map((item) => (
                    item.aspect?.map((item, idx) => (
                      <Tabs.Trigger
                        key={idx}
                        value={item.value}
                        className="flex !justify-start items-center group w-full data-[state=active]:bg-neutral-100/10"
                      >
                        <Typography className="text-base text-left">
                          &nbsp;&nbsp;{item.title}
                        </Typography>
                      </Tabs.Trigger>
                    ))
                  ))}
                </Accordion.ItemContent>
              </Accordion.Item>
            </Accordion.Root>
            {WIKI_HEADERS.map((item) => (
              item.links?.map((item, idx) => (
                <div key={idx} className="flex flex-row items-center justify-between group cursor-pointer">
                  {item.isTab ? (
                    <Tabs.Trigger value={item.value}>
                      <Typography className="text-xl">
                        {item.title}
                      </Typography>
                    </Tabs.Trigger>
                  ) : (
                    <div onClick={() => handlePush(item.value)}>
                      <Typography className="text-xl">
                        {item.title}
                      </Typography>
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Typography className="text-3xl">
            Прочее
          </Typography>
          <Link href="/wiki/modpack" className="group cursor-pointer">
            <Typography className="text-base">
              Сборки модов
            </Typography>
          </Link>
        </div>
      </div>
    </Tabs.List>
  )
}