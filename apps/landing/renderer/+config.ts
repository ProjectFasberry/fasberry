import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import vikePhoton from 'vike-photon/config'

export default {
  title: "Fasberry",
  extends: [vikeReact, vikePhoton],
  reactStrictMode: false,
  prefetchStaticAssets: 'viewport',
  passToClient: ['snapshot'],
  ssr: true,
  redirects: {
    "/wiki": "/wiki/general"
  }
} satisfies Config;
