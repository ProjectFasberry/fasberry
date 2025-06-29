import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../shared/layouts/layout-default.js";

export default {
  Layout,
  title: "Fasberry",
  extends: vikeReact,
  reactStrictMode: false,
  passToClient: ['snapshot']
} satisfies Config;