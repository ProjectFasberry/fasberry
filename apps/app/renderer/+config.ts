import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import vikeServer from 'vike-server/config'

export default {
  title: "Fasberry",
  extends: [vikeReact, vikeServer],
  server: 'server/index.js',
  reactStrictMode: false,
  passToClient: ['snapshot'],
  ssr: false,
  redirects: {
    '/private': '/private/config',
    '/chat': "https://discord.gg/X4x6Unj89g"
  }
} satisfies Config;