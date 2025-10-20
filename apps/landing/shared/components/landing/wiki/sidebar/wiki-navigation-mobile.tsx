import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import { TabsList, TabsTrigger } from "@repo/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/accordion";
import { IconCategory } from "@tabler/icons-react";
import { Typography } from "@repo/ui/typography";
import { Link } from "@/shared/components/config/link";
import { navigate } from "vike/client/router";
import { wikiParamAtom } from "../content/wiki-content";
import { reatomComponent } from "@reatom/npm-react";
import { useState } from "react";
import { WIKI_HEADERS } from "@/shared/data/configs";

export const WikiNavigationMobile = reatomComponent(({ ctx }) => {
  const [open, setOpen] = useState(false)

  const handle = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={v => setOpen(v)}>
      <SheetTrigger className="xl:hidden flex items-center justify-center aspect-square fixed bottom-6 right-6 z-30 px-2 py-1 rounded-md bg-white/20 backdrop-blur-md">
        <IconCategory size={34} />
      </SheetTrigger>
      <SheetContent className="xl:hidden bg-neutral-950 gap-6 p-4 border-none max-w-4xl overflow-y-auto">
        <SheetTitle>Вики</SheetTitle>
        <TabsList className="flex flex-col w-full items-start">
          <div className="flex flex-col p-4 w-full gap-y-12 h-full">
            <div className="flex flex-col gap-y-2">
              <TabsTrigger onClick={handle} value="general" className="p-1 justify-start items-start">
                <Typography className="text-xl">
                  Основной раздел
                </Typography>
              </TabsTrigger>
              <Accordion type="single" collapsible defaultValue="aspects">
                <AccordionItem value="aspects">
                  <AccordionTrigger className="py-0 my-0 group">
                    <Typography className="text-xl">
                      Аспекты игры <span className="text-base text-neutral-300">{`>`}</span>
                    </Typography>
                  </AccordionTrigger>
                  <AccordionContent className="flex gap-1 flex-row w-full h-full">
                    <div className="w-[2px] mt-1 bg-neutral-700" />
                    <div className="flex flex-col gap-0.5 h-full w-full">
                      {WIKI_HEADERS.map((item) => (
                        item.aspect?.map((item, idx) => (
                          <TabsTrigger
                            key={idx}
                            value={item.value}
                            onClick={handle}
                            data-state={item.value === ctx.spy(wikiParamAtom) ? "active" : "inactive"}
                            className="flex items-center justify-start w-full py-1 hover:bg-neutral-300/20 data-[state=active]:bg-green/60 rounded-md"
                          >
                            <Typography className="text-base text-left">
                              &nbsp;&nbsp;{item.title}
                            </Typography>
                          </TabsTrigger>
                        ))
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {WIKI_HEADERS.map((item) => (
                item.links?.map((item, idx) => (
                  <div key={idx} className="flex flex-row items-center justify-between group cursor-pointer">
                    {item.isTab ? (
                      <TabsTrigger onClick={handle} value={item.value} className="justify-start items-start">
                        <Typography className="text-xl">
                          {item.title}
                        </Typography>
                      </TabsTrigger>
                    ) : (
                      <div onClick={() => navigate(item.value)}>
                        <Typography className="text-xl">
                          {item.title}
                        </Typography>
                      </div>
                    )}
                  </div>
                ))
              ))}
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
        </TabsList>
      </SheetContent>
    </Sheet>
  )
}, "WikiNavigationMobile")