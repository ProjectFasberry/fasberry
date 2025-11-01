import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
// import vikeServer from 'vike-server/config'
import vikePhoton from 'vike-photon/config'

export default {
  title: "Fasberry",
  extends: [vikeReact, vikePhoton],
  // server: 'server/index.js',
  photon: {
    server: 'server/index.js'
  },
  reactStrictMode: false,
  passToClient: ['snapshot', 'locale'],
  ssr: false,
  redirects: {
    '/chat': "https://discord.gg/X4x6Unj89g"
  }
} satisfies Config;