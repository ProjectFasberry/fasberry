import { ReactNode } from "react"
import { SettingsAppWidgets } from "../components/settings-app-widgets"
import { SettingsMainProfile } from "../components/settings-main-profile"
import { SettingsMainSecurity } from "../components/settings-main-security"
import { IconAspectRatio, IconShieldHalfFilled, IconUserCircle, TablerIcon } from "@tabler/icons-react"

export const SETTINGS_FALLBACK = "/settings/main/profile"

export const SETTINGS_NODES: Record<string, { [key: string]: ReactNode }> = {
  main: {
    profile: <SettingsMainProfile />,
    security: <SettingsMainSecurity />,
  },
  app: {
    widgets: <SettingsAppWidgets />
  }
}

export type SettingsNavigation = {
  title: string,
  nodes: {
    title: string, href: string, icon: TablerIcon
  }[]
}

export const SETTINGS_NAVIGATION: { [key: string]: SettingsNavigation } = {
  main: {
    title: "Основные настройки",
    nodes: [
      { title: "Профиль", href: "/settings/main/profile", icon: IconUserCircle },
      { title: "Безопасность", href: "/settings/main/security", icon: IconShieldHalfFilled },
    ]
  },
  app: {
    title: "Настройки приложения",
    nodes: [
      { title: "Виджеты", href: "/settings/app/widgets", icon: IconAspectRatio },
    ]
  }
}