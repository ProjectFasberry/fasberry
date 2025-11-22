import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import vikePhoton from 'vike-photon/config'
import { SETTINGS_FALLBACK } from "@/shared/components/app/settings/models/settings.model";

export default {
  title: "Fasberry",
  extends: [vikeReact, vikePhoton],
  photon: {
    server: 'server/index.js'
  },
  reactStrictMode: false,
  passToClient: ['snapshot', 'locale'],
  ssr: false,
  redirects: {
    '/chat': "https://discord.gg/X4x6Unj89g",
    '/settings': SETTINGS_FALLBACK
  }
} satisfies Config;