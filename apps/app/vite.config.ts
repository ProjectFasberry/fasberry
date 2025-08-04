import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

const env = loadEnv('all',process.cwd());

const port = Number(env.APP_PORT)
const host = env.APP_HOST

export default defineConfig({
  plugins: [
    vike(),
    react(),
    tailwindcss()
  ],
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
});
