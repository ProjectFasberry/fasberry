import { Typography } from "@repo/ui/typography"
import { ReactNode } from "react"

export const SettingsHeader = ({ title, subtitle }: { title: string, subtitle: string }) => {
  return (
    <div className="flex flex-col min-w-0">
      <Typography className="text-xl font-semibold">
        {title}
      </Typography>
      <Typography className="truncate text-neutral-400 text-base">
        {subtitle}
      </Typography>
    </div>
  )
}

export const SettingsSection = ({ title, subtitle, component }: { title: string, subtitle: string, component: ReactNode }) => {
  return (
    <div className="flex flex-col gap-2 w-fit">
      <SettingsHeader title={title} subtitle={subtitle} />
      {component}
    </div>
  )
}