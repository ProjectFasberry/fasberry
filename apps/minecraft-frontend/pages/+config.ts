import vikeReact from "vike-react/config";
import type { Config } from "vike/types";
import Layout from "../layouts/LayoutDefault.js";

export default {
  Layout,
  title: "Fasberry",
  description: "Minecraft Fasberry Project. Init description",
  extends: vikeReact,
} satisfies Config;