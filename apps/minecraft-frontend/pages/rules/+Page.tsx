import { Link } from "@/shared/components/config/Link";
import { Rules } from "@/shared/components/landing/rules/rules";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { Overlay } from "@/shared/ui/overlay";
import { WrapperTitle } from "@/shared/ui/wrapper-title";

export default function RulesPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        className={`full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom md:bg-center bg-cover
						bg-[url('/images/backgrounds/rules_background.png')]`}
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
            <div className="flex flex-col gap-1 lg:max-w-3xl">
              <p className="text-left text-shadow-xl text-5xl lg:text-6xl text-gold mb-2">
                Правила проекта
              </p>
              <p className="text-left text-white text-2xl md:text-3xl">
                Правила созданы для чего? Чтобы их не нарушать!
              </p>
            </div>
            <Link href="#rules-list">
              <button
                className="btn hover:bg-[#a20f40] rounded-xl border border-[#8a113c] bg-[#8a113c]"
              >
                <p className="text-white font-bold text-xl">
                  <span
                    className="inline-block group-hover:rotate-0 rotate-90 duration-150 group-hover:duration-150"
                  >
                    ✎
                  </span>
                  &nbsp;К правилам
                </p>
              </button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section py-32">
        <div className="flex flex-col gap-y-10 responsive mx-auto">
          <div
            className="flex flex-col md:flex-row gap-y-4 border-2 border-[#454545] hover:duration-300
					    duration-300 lg:gap-y-2 py-4 p-2 rounded-[8px] justify-between"
          >
            <div className="flex items-start lg:items-center gap-x-2">
              <p
                title="Типа теги, чтобы было круто"
                className="text-xl text-black dark:text-white"
              >
                Теги:
              </p>
              <div className="flex flex-wrap gap-2">
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #правила
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #база
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #кодекс
                </div>
                <div
                  className="flex bg-white/10 items-center rounded-[8px] px-2 text-xs md:text-base lg:text-md transition-colors"
                >
                  #никтонечитает
                </div>
              </div>
            </div>
          </div>
          <Rules />
        </div>
      </div>
    </MainWrapperPage>
  )
}