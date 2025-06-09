import { TabsList, TabsTrigger } from "@repo/landing-ui/src/tabs"
import { Typography } from "@repo/landing-ui/src/typography"
import EndCrystal from "@repo/assets/images/minecraft/end_crystal.webp"
import Belkoin from "@repo/assets/images/minecraft/belkoin_wallet.png"
import Elytra from "@repo/assets/images/minecraft/elytra.webp"
import { useQueryClient } from "@tanstack/react-query"
import { SHOP_ITEM_QUERY_KEY, ShopItemQuery } from "./shop"

export const ShopNavigation = () => {
  const qc = useQueryClient()

  const handleTabChange = (value: ShopItemQuery["category"]) => {
    qc.setQueryData(SHOP_ITEM_QUERY_KEY, (prev: ShopItemQuery) => ({
      ...prev,
      category: value,
      paymentType: null,
      paymentValue: null
    }))
  }

  return (
    <TabsList className="flex lg:flex-row flex-col items-center gap-4 *:duration-300 *:transition-all *:ease-in-out *:p-4">
      <TabsTrigger
        value="donate"
        className="data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#e28100] 
        data-[state=active]:from-[#e28100] data-[state=active]:via-[#e28100] 
        data-[state=active]:to-[#ffaa00] w-full lg:w-1/5 xl:w-1/6 data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
        onClick={() => handleTabChange("donate")}
      >
        <Typography className="text-white text-[20px]">
          Привилегии
        </Typography>
        <img src={Elytra.src} width={28} height={28} alt="" />
      </TabsTrigger>
      <span className="hidden lg:inline text-[20px] text-neutral-300">⏺</span>
      <TabsTrigger
        value="wallet"
        className="data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#db1ed7] 
        data-[state=active]:from-[#db1ed7] data-[state=active]:via-[#db1ed7] 
        data-[state=active]:to-[#f73ef6] w-full lg:w-1/5 xl:w-1/6 data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
        onClick={() => handleTabChange("wallet")}
      >
        <Typography className="text-white text-[20px]">
          Валюта
        </Typography>
        <img src={Belkoin.src} width={28} height={28} alt="" />
      </TabsTrigger>
      <span className="hidden lg:inline text-[20px] text-neutral-300">⏺</span>
      <TabsTrigger
        value="events"
        className="data-[state=active]:bg-gradient-to-r gap-2 
        items-center data-[state=active]:border-[#05b458] 
        data-[state=active]:from-[#05b458] data-[state=active]:via-[#05b458] 
        data-[state=active]:to-[#0fd86d] w-full lg:w-1/5 xl:w-1/6 data-[state=inactive]:border-neutral-500 
        data-[state=inactive]:bg-neutral-800 border-2 rounded-xl"
        onClick={() => handleTabChange("events")}
      >
        <Typography className="text-white text-[20px]">
          Ивенты
        </Typography>
        <img src={EndCrystal.src} width={28} height={28} alt="" />
      </TabsTrigger>
    </TabsList>
  )
}