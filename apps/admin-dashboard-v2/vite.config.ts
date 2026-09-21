import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import path from "node:path";

const config = defineConfig({
  // nitro() mengambil alih dev server, jadi `server.proxy` diabaikan dan request
  // /bff jatuh ke handler HTML (406). Proxy harus lewat opsi devProxy nitro.
  nitro: {
    devProxy: {
      // Harus pola wildcard: devProxy mendaftarkan app.all(route) sehingga
      // "/bff" hanya cocok persis dan /bff/api/* jatuh ke handler SSR.
      "/bff/**": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "#": path.resolve(__dirname, "./src"),
    },
    tsconfigPaths: true,
  },
  plugins: [
    devtools({
      injectSource: {
        enabled: true,
        ignore: {
          components: ["FullCalendar"],
        },
      },
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
});

export default config;
