import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { Typography } from "@/shared/ui/typography";
import { MAIL_FASBERRY_SUPPORT, TELEGRAM_CHANNEL_LINK, VK_GROUP_LINK } from "@repo/shared/wiki/data/configs";

export default function InfoContactsPage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        id="contacts-n-feedback"
        className="flex flex-col min-h-screen responsive mx-auto py-36 gap-y-6"
      >
        <Typography className="text-black dark:text-white text-3xl">
          Контакты
        </Typography>
        <div className="flex flex-col gap-y-8 rounded-[8px]">
          <div
            className="flex flex-col gap-y-4 border-2 border-[#454545] hover:duration-300 duration-300 rounded-[8px] p-4">
            <Typography color="white" className="text-xl">
              Социальные сети и мессенджеры
            </Typography>
            <div className="flex flex-col text-white text- md lg:text-lg gap-y-4">
              <Typography color="white">Группа VK:&nbsp;
                <a href='https://vk.com/fasberry' target="_blank">
                  {VK_GROUP_LINK}
                </a>
              </Typography>
              <Typography color="white">Канал в Telegram:&nbsp;
                <a href='https://t.me/fasberry' target="_blank">
                  {TELEGRAM_CHANNEL_LINK}
                </a>
              </Typography>
            </div>
          </div>
          <div
            className="flex flex-col gap-y-4 border-2 text-md lg:text-lg border-[#454545] hover:duration-300 duration-300 rounded-[8px] p-4">
            <Typography color="white" className="text-xl">
              Электронная почта
            </Typography>
            <div className="flex flex-col gap-y-4">
              <a
                href={`mailto:${MAIL_FASBERRY_SUPPORT}`}
                target="_blank"
              >
                <Typography color="white">
                  {MAIL_FASBERRY_SUPPORT}
                </Typography>
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainWrapperPage>
  )
}