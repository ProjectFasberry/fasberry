import { WIKI_HEADERS } from "@repo/shared/wiki/data/configs"
import { navigate } from "vike/client/router";
import { Link } from "@/shared/components/config/Link";
import { Typography } from "@/shared/ui/typography";
import { reatomComponent } from "@reatom/npm-react";
import { wikiParamAtom } from "../content/wiki-content";
import { TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";

export const WikiNavigationBar = reatomComponent(({ ctx }) => {
  return (
    <TabsList className="hidden xl:flex flex-col p-0 w-full xl:w-[25%] items-start sticky top-0">
      <div className="flex flex-col p-4 w-full gap-y-12 h-full">
        <div className="flex flex-col gap-y-2">
          <TabsTrigger value="general" className="px-0 justify-start items-start">
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
                  <TabsTrigger value={item.value} className="px-0 justify-start items-start">
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
  )
}, "WikiNavigationBar")