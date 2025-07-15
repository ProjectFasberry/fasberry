import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../shared/layout/layout-default.js";

export default {
  Layout,
  title: "Fasberry",
  extends: vikeReact,
  reactStrictMode: false,
  passToClient: ['snapshot'],
  ssr: false
} satisfies Config;