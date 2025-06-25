import { Link } from "@/shared/components/config/Link";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { Overlay } from "@/shared/ui/overlay";
import { WrapperTitle } from "@/shared/ui/wrapper-title";

export default function SupportPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        className="full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom bg-no-repeat bg-cover
     bg-[url('/images/backgrounds/support_background.png')]"
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 w-full lg:max-w-3xl items-start justify-center">
            <div className="flex flex-col gap-1 w-full lg:max-w-3xl">
              <p className="text-left text-shadow-xl text-5xl lg:text-6xl text-gold mb-2">
                Поддержка проекта
              </p>
              <p className="text-left text-white text-2xl md:text-3xl">
                Здесь можно узнать о способах поддержки развития проекта. Это не связано с донатом!
              </p>
            </div>
            <Link href="#support-list">
              <button
                className="btn hover:bg-[#86600d] rounded-xl border border-[#86600d] bg-[#724e11]"
              >
                <p className="text-white font-bold text-xl">
                  <span className="inline-block duration-150 group-hover:duration-150">
                    ○
                  </span>
                  &nbsp;К поддержке
                </p>
              </button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div id="support-list" className="full-screen-section flex flex-col justify-center items-center relative py-24 lg:py-36">
        <div className="flex flex-col justify-center gap-y-6 w-[90%] mx-auto">
          <div className="flex flex-col justify-center items-center mb-6">
            <p
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-black dark:text-white"
            >
              Поддержка проекта
            </p>
            <p
              className="text-dark-red text-xl text-center dark:text-gold"
            >
              ниже представлены пока что основные способы помочь проекту. Спасибо!
            </p>
          </div>
          <div
            className="flex rounded-xl flex-col md:flex-row overflow-hidden md:items-center items-start gap-x-6 gap-y-4 w-full"
          >
            <img
              width={566}
              height={566}
              alt="Monitoring Steve"
              className="md:h-[322px] xl:h-[352px] w-fit rounded-[8px]"
              src="/images/support/steve.webp"
            />
            <div className="flex flex-col items-start p-2 gap-y-2 md:p-0 lg:w-1/2 w-full">
              <h1 className="text-shadow-md text-xl lg:text-2xl xl:text-4xl 2xl:text-6xl text-fuchsia-400 mb-2">
                Мониторинг
              </h1>
              <div className="flex flex-col">
                <p
                  className="text-md lg:text-lg xl:text-xl 2xl:text-2xl  text-black dark:text-white"
                >
                  Я лично выставил сервер на несколько сайтов-мониторингов.
                </p>
                <p
                  className="text-md lg:text-lg xl:text-xl 2xl:text-2xl  text-black dark:text-white"
                >
                  &quot;Зачем ты это сделал?&quot; - задашь ты мне вопрос
                </p>
                <p
                  className="text-md lg:text-lg xl:text-xl 2xl:text-2xl  text-black dark:text-white"
                >
                  Ну, во-первых, это халявный трафик, хоть и малый.
                </p>
                <p
                  className="text-md lg:text-lg xl:text-xl 2xl:text-2xl text-black dark:text-white"
                >
                  А во-вторых, тебе же легко просто проголосовать за сервер, да?
                </p>
              </div>
              <div className="flex flex-col mt-4">
                <a target="_blank" href="https://hotmc.ru/vote-259308" rel="noreferrer">
                  <div className="flex justify-between items-center button px-6 py-1">
                    <p className="text-white text-xl">
                      Проголосовать
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div
            className="flex rounded-xl flex-col md:flex-row overflow-hidden md:items-center items-start gap-x-6 gap-y-4 w-full"
          >
            <img
              width={512}
              height={512}
              className="md:w-[322px] md:h-[322px] xl:w-[352px] xl:h-[352px] rounded-[8px]"
              src="/images/support/alex.webp"
              alt="share Fasberry Project"
            />
            <div className="flex flex-col items-start p-2 gap-y-2 md:p-0 lg:w-1/2 w-full">
              <h1 className='text-shadow-md text-xl lg:text-2xl xl:text-4xl 2xl:text-6xl text-fuchsia-400 mb-4'>
                Знакомый знакомому
              </h1>
              <p
                className="text-md lg:text-lg xl:text-xl 2xl:text-2xl  text-black dark:text-white"
              >
                Расскажи об этом сервере своим друзьям, может знакомым, зайдите вечерком, поиграйте. Если зайдет, то
                возможно вы станете легендами.
                Я думаю хороший обмен.
              </p>
              <div className="flex flex-col lg:flex-row justify-start w-full gap-x-4 mt-4 gap-y-2">
                <a href="https://telegram.me/share/url?url=https%3A%2F%2Fmc.fasberry.su&text=" rel="noreferrer"  target="_blank">
                  <div className="flex justify-between items-center button px-4 py-1">
                    <p className="text-xl text-white">
                      Поделиться в телеграмме
                    </p>
                  </div>
                </a>
                <a href="https://vk.com/share.php?url=https%3A%2F%2Fmc.fasberry.su&title=" rel="noreferrer" target="_blank">
                  <div className="flex justify-between items-center button px-4 py-1">
                    <p className="text-xl text-white">
                      Поделиться во вконтакте
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}