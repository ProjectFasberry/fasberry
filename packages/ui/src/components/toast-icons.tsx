import WhiteCandle from "@repo/assets/images/minecraft/white_candle.webp"
import RedCandle from "@repo/assets/images/minecraft/red_candle.webp"
import LimeCandle from "@repo/assets/images/minecraft/lime_candle.webp"
import YellowCandle from "@repo/assets/images/minecraft/yellow_candle.webp"

export const InfoIcon = () => {
  return <img src={WhiteCandle} width={24} height={24} alt="" />
}

export const WarningIcon = () => {
  return <img src={YellowCandle} width={24} height={24} alt="" />
}

export const ErrorIcon = () => {
  return <img src={RedCandle} width={24} height={24} alt="" />
}

export const SuccessIcon = () => {
  return <img src={LimeCandle} width={24} height={24} alt="" />
}