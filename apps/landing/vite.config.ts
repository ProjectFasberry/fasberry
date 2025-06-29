import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vike from "vike/plugin";
import mdx from '@mdx-js/rollup'
import path from 'path'; 

export default defineConfig({
  plugins: [
    {
      enforce: 'pre', ...mdx({})
    },
    vike(),
    react(),
    tailwindcss(),
  ],
  build: {
    target: "es2022",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
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
    allowedHosts: true
  },
  server: {
    allowedHosts: true
  }
});
