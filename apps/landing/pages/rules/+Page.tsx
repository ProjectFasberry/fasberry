import { Link } from "@/shared/components/config/link";
import { Rules } from "@/shared/components/landing/rules/rules";
import { Button } from "@repo/ui/button";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Overlay } from "@repo/ui/overlay";
import { Typography } from "@repo/ui/typography";
import { WrapperTitle } from "@repo/ui/wrapper-title";

export default function RulesPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        className={`full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start
					bg-bottom md:bg-center bg-cover bg-[url('/images/backgrounds/rules_background.png')]
        `}
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
            <div className="flex flex-col gap-2 lg:max-w-3xl">
              <h1 className="text-left text-shadow-xl text-5xl lg:text-6xl text-gold">
                Правила проекта
              </h1>
              <Typography color="white" className="text-left text-2xl md:text-3xl">
                Правила созданы для чего? Чтобы их не нарушать!
              </Typography>
            </div>
            <Link href="#rules-list">
              <Button variant="minecraft" className="group px-6 py-0.5 gap-2">
                <span className="font-[Monocraft] relative -top-0.5 group-hover:rotate-0 rotate-90 duration-150">✎</span>
                <Typography color="white" className="text-lg">
                  &nbsp;Список правил
                </Typography>
              </Button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section py-32">
        <div className="flex flex-col gap-y-10 responsive mx-auto">
          <div
            className="flex flex-col md:flex-row border-2 w-full border-[#454545] gap-2 lg:gap-4 p-2 lg:p-4 justify-between"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
              <Typography title="Актуальные теги" color="white" className="text-md lg:text-lg xl:text-xl">
                Актуальные теги:
              </Typography>
              <div className="flex flex-wrap gap-2 *:flex *:bg-white/10 *:items-center *:rounded-sm *:text-xs *:md:text-base *:lg:text-md *:px-2">
                <div>#правила</div>
                <div>#база</div>
                <div>#кодекс</div>
                <div>#никтонечитает</div>
              </div>
            </div>
          </div>
          <Rules />
        </div>
      </div>
    </MainWrapperPage>
  )
}