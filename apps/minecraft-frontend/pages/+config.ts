import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../shared/layouts/LayoutDefault.js";

export default {
  Layout,
  title: "Fasberry",
  extends: vikeReact,
  reactStrictMode: false,
  prefetchStaticAssets: 'viewport'
} satisfies Config;