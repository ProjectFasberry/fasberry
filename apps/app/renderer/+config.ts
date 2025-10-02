import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../shared/layout/layout-default.js";
import vikeServer from 'vike-server/config'

export default {
  Layout,
  title: "Fasberry",
  extends: [vikeReact, vikeServer],
  server: 'server/index.js',
  reactStrictMode: false,
  passToClient: ['snapshot'],
  ssr: false,
} satisfies Config;