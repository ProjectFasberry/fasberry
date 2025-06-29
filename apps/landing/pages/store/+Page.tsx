import { Link } from "@/shared/components/config/Link";
import { Shop } from "@/shared/components/landing/shop/shop";
import { Button } from "@repo/ui/button";
import { MainWrapperPage } from "@repo/ui/main-wrapper";
import { Overlay } from "@repo/ui/overlay";
import { Typography } from "@repo/ui/typography";
import { WrapperTitle } from "@repo/ui/wrapper-title";

export default function StorePage() {
  return (
    <MainWrapperPage variant="with_section">
      <div
        className="full-screen-section h-[80vh] lg:min-h-screen flex items-center justify-start
          bg-bottom md:bg-center overflow-hidden bg-no-repeat bg-cover bg-[url('/images/backgrounds/donate_background.png')]"
      >
        <Overlay variant="default" />
        <WrapperTitle>
          <div className="flex flex-col gap-6 items-start justify-center w-full lg:max-w-3xl">
            <div className="flex flex-col gap-2 w-full lg:max-w-3xl">
              <h1 className="text-left text-5xl lg:text-6xl text-gold">
                Магазин
              </h1>
              <Typography color="white" className="text-left text-2xl md:text-3xl">
                Здесь можно купить привилегии, игровую валюту или ивент.
              </Typography>
            </div>
            <Link href="#list">
              <Button className="hover:bg-[#8c1c85] group border border-[#8c1c85] bg-[#731c6c]">
                <Typography color="white" className="font-bold text-xl">
                  <span className="inline-block group-hover:rotate-0 rotate-90 duration-150">
                    ⭐
                  </span>
                  &nbsp;Товары
                </Typography>
              </Button>
            </Link>
          </div>
        </WrapperTitle>
      </div>
      <div className="full-screen-section flex flex-col min-h-screen items-center">
        <div id="list" className="flex flex-col py-32 gap-6 responsive mx-auto">
          <div className="flex flex-col items-center justify-center">
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