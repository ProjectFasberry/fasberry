import { Link } from "@/shared/components/config/link";
import { getStaticObject } from "@/shared/lib/volume";
import { Button } from "@repo/ui/button";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Overlay } from "@repo/ui/overlay";
import { Typography } from "@repo/ui/typography";
import { WrapperTitle } from "@repo/ui/wrapper-title";

export default function SupportPage() {
  const url = getStaticObject("background", "support_background.png");

  return (
    <MainWrapperPage variant="with_section">
      <div
        className={`full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start
          bg-bottom bg-no-repeat bg-cover
        `}
        style={{ backgroundImage: `url(${url})` }}
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
            <div className="flex flex-col gap-2 w-full lg:max-w-3xl">
              <h1 className="text-left text-shadow-xl text-5xl lg:text-6xl text-gold">
                Поддержка проекта
              </h1>
              <Typography color="white" className="text-left text-2xl md:text-3xl">
                Здесь можно узнать о способах поддержки развития проекта. Это не связано с донатом!
              </Typography>
            </div>
            <Link href="#support-list">
              <Button variant="minecraft" className="group px-6 py-0.5 gap-2">
                <span className="font-[Monocraft] relative -top-0.5 group-hover:rotate-0 rotate-90 duration-150">○</span>
                <Typography color="white" className="text-lg">
                  &nbsp;Как поддержать?
                </Typography>
              </Button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div id="support-list" className="full-screen-section flex flex-col justify-center items-center relative py-24 lg:py-36">
        <div className="flex flex-col justify-center gap-y-6 w-[90%] mx-auto">
          <div className="flex flex-col justify-center items-center mb-6">
            <Typography
              color="white" className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl"
            >
              Поддержка проекта
            </Typography>
            <Typography className="text-xl text-center text-gold">
              ниже представлены пока что основные способы помочь проекту. Спасибо!
            </Typography>
          </div>
          <div
            className="flex flex-col sm:flex-row gap-4 w-full h-full 
            *:flex *:flex-col *:xl:flex-row *:bg-neutral-900 *:rounded-xl
              *:overflow-hidden *:p-3 *:lg:p-4 *:md:items-center *:justify-center *:md:justify-start *:items-center *:gap-4 *:lg:gap-6 *:w-full
            "
          >
            <div>
              <img
                width={244}
                height={244}
                loading="lazy"
                alt="Monitoring"
                className="max-h-[244px] w-auto"
                src={getStaticObject("support", "steve.webp")}
              />
              <div className="flex flex-col items-center xl:items-start gap-1 md:gap-2 w-full">
                <h1 className="text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-fuchsia-400">
                  Мониторинг
                </h1>
                <div className="flex flex-col mt-2 w-full">
                  <a
                    target="_blank"
                    href="https://hotmc.ru/vote-259308"
                    rel="noreferrer"
                    className="flex justify-center w-full xl:w-fit items-center button px-4 py-1"
                  >
                    <Typography color="white" className="text-nowrap text-base lg:text-xl">
                      Проголосовать
                    </Typography>
                  </a>
                </div>
              </div>
            </div>
            <div>
              <img
                width={244}
                height={244}
                className="max-h-[244px] w-auto"
                src={getStaticObject("support", "alex.webp")}
                loading="lazy"
                alt="Share"
              />
              <div className="flex flex-col items-center xl:items-start gap-2 w-full">
                <h1 className='text-shadow-md text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-fuchsia-400'>
                  Поделиться
                </h1>
                <div
                  className="flex flex-col justify-center md:justify-start w-full gap-2 mt-2
                    *:flex *:justify-center *:w-full *:xl:w-fit *:items-center *:px-4 *:py-1
                  "
                >
                  <a
                    href="https://telegram.me/share/url?url=https%3A%2F%2Fmc.fasberry.su&text="
                    rel="noreferrer"
                    target="_blank"
                    className="button"
                  >
                    <Typography color="white" className="text-nowrap text-base lg:text-xl">
                      Поделиться в телеграмме
                    </Typography>
                  </a>
                  <a
                    href="https://vk.com/share.php?url=https%3A%2F%2Fmc.fasberry.su&title="
                    rel="noreferrer"
                    target="_blank"
                    className="button"
                  >
                    <Typography color="white" className="text-base lg:text-xl">
                      Поделиться в вк
                    </Typography>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}