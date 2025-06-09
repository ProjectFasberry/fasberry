"use client"

import { WIKI_HEADERS } from "@repo/shared/wiki/data/configs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/src/components/accordion';
import { Block } from "@repo/landing-ui/src/block"
import { TabsList, TabsTrigger } from "@repo/landing-ui/src/tabs"
import { Typography } from "@repo/landing-ui/src/typography"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const WikiNavigationBar = () => {
  const { push } = useRouter();

  const handlePush = (value: string) => {
    push(value)
  }

  return (
    <TabsList className="hidden xl:flex flex-col p-0 rounded-xl w-full xl:w-[30%] items-start sticky top-0">
      <Block border="mini_gray" className="gap-y-12 h-full" size="normal" rounded="big" type="column">
        <div className="flex flex-col gap-y-2">
          <Typography className="text-3xl">
            Общая информация
          </Typography>
          <div className="flex flex-col gap-y-2">
            <div className="flex flex-row justify-between items-center group cursor-pointer">
              <TabsTrigger value="general">
                <Typography size="xl" hover_effects="pink_drop">
                  Основной раздел
                </Typography>
              </TabsTrigger>
            </div>
            <Accordion type="single" collapsible defaultValue="aspects">
              <AccordionItem value="aspects">
                <AccordionTrigger className="py-0 my-0 group">
                  <Typography size="xl" hover_effects="pink_drop">
                    Аспекты игры
                  </Typography>
                </AccordionTrigger>
                <AccordionContent>
                  {WIKI_HEADERS.map((item) => (
                    item.aspect?.map((item, idx) => (
                      <TabsTrigger
                        key={idx}
                        value={item.value}
                        className="flex !justify-start items-center group w-full data-[state=active]:bg-neutral-100/10"
                      >
                        <Typography size="base" hover_effects="pink_drop" className="text-left">
                          &nbsp;&nbsp;{item.title}
                        </Typography>
                      </TabsTrigger>
                    ))
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {WIKI_HEADERS.map((item) => (
              item.links?.map((item, idx) => (
                <div key={idx} className="flex flex-row items-center justify-between group cursor-pointer">
                  {item.isTab ? (
                    <TabsTrigger value={item.value}>
                      <Typography size="xl" hover_effects="pink_drop">
                        {item.title}
                      </Typography>
                    </TabsTrigger>
                  ) : (
                    <div onClick={() => handlePush(item.value)}>
                      <Typography size="xl" hover_effects="pink_drop">
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
            <Typography size="base" hover_effects="pink_drop">
              Сборки модов
            </Typography>
          </Link>
        </div>
      </Block>
    </TabsList>
  )
}