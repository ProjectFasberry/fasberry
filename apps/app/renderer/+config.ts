import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import vikeServer from 'vike-server/config'

export default {
  title: "Fasberry",
  extends: [vikeReact, vikeServer],
  server: 'server/index.js',
  reactStrictMode: false,
  passToClient: ['snapshot', 'locale'],
  ssr: false,
  redirects: {
    '/chat': "https://discord.gg/X4x6Unj89g"
  }
} satisfies Config;