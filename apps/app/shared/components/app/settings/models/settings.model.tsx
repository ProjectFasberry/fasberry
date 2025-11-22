import { ReactNode } from "react"
import { SettingsAppWidgets } from "../components/settings-app-widgets"
import { SettingsMainProfile } from "../components/settings-main-profile"
import { SettingsMainSecurity } from "../components/settings-main-security"

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

export const SETTINGS_NAVIGATION = {
  main: {
    title: "Основные настройки",
    nodes: [
      { title: "Профиль", href: "/settings/main/profile" },
      { title: "Безопасность", href: "/settings/main/security" },
    ]
  },
  app: {
    title: "Настройки приложения",
    nodes: [
      { title: "Виджеты", href: "/settings/app/widgets" },
    ]
  }
}