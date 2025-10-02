import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const host = env.VITE_APP_HOST
  const port = Number(env.VITE_APP_PORT)

  return {
    plugins: [
      vike(),
      react(),
      tailwindcss()
    ],
    ssr: {
      noExternal: ['@tabler/icons-react']
    },
    build: {
      target: "es2022",
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules') &&
              // solution to error when sentry tries to initiate variable access before .env assignment
              // Uncaught ReferenceError: Cannot access '.env.dsn' before initialization
              !id.includes("sentry")
            ) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      },
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
    }
  }
});
