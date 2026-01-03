import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import tsconfigPaths from 'vite-tsconfig-paths'
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()) as ImportMetaEnv;

  const host = env.VITE_APP_HOST
  const port = Number(env.VITE_APP_PORT)

  return {
    plugins: [
      vike(),
      react(),
      tailwindcss(),
      tsconfigPaths(),
      analyzer({ enabled: false })
    ],
    ssr: {
      noExternal: process.env.NODE_ENV === 'production' ? true : undefined
    },
    build: {
      target: "es2022",
      sourcemap: false
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        "@": new URL("./", import.meta.url).pathname,
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs'
      },
    },
    preview: {
      host, port,
      allowedHosts: true
    },
    server: {
      host, port,
      allowedHosts: true
    },
  }
});
