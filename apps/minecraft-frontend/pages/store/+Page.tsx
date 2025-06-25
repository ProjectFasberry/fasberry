import { Link } from "@/shared/components/config/Link";
import { Shop } from "@/shared/components/landing/shop/shop";
import { MainWrapperPage } from "@/shared/ui/main-wrapper";
import { Overlay } from "@/shared/ui/overlay";
import { Typography } from "@/shared/ui/typography";
import { WrapperTitle } from "@/shared/ui/wrapper-title";

export default function StorePage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        className="full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start bg-bottom md:bg-center overflow-hidden bg-no-repeat bg-cover
        bg-[url('/images/backgrounds/donate_background.png')]"
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 items-start justify-center w-full lg:max-w-3xl">
            <div className="flex flex-col gap-1 w-full lg:max-w-3xl">
              <Typography className="text-left text-5xl lg:text-6xl text-gold mb-2">
                Магазин
              </Typography>
              <Typography color="white" className="text-left text-2xl md:text-3xl">
                Здесь можно купить привилегии, игровую валюту или ивент.
              </Typography>
            </div>
            <Link href="#list">
              <button
                className="btn hover:bg-[#8c1c85] rounded-xl border border-[#8c1c85] bg-[#731c6c]"
              >
                <Typography color="white" className="font-bold text-xl">
                  <span
                    className="inline-block group-hover:rotate-0 rotate-90 duration-150 group-hover:duration-150"
                  >
                    ⭐
                  </span>
                  &nbsp;К товарам
                </Typography>
              </button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section flex flex-col min-h-screen items-center">
        <div id="list" className="flex flex-col py-32 responsive mx-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <Typography color="white" variant="block_title" className="text-center">
              Товары
            </Typography>
          </div>
          <Shop />
        </div>
      </div>
    </MainWrapperPage>
  )
}