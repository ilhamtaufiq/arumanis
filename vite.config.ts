import path from "path"
import { fileURLToPath } from "url"
import { spawn, type ChildProcess } from "node:child_process"
import { mkdirSync, writeFileSync } from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"
import { LANDING_CRITICAL_CSS } from "./src/features/public/landing-shell.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BFF_PORT = process.env.PORT || "8787"
const BFF_HEALTH_URL = `http://127.0.0.1:${BFF_PORT}/health/live`

async function isBffRunning(): Promise<boolean> {
  try {
    const response = await fetch(BFF_HEALTH_URL, { signal: AbortSignal.timeout(1500) })
    return response.ok
  } catch {
    return false
  }
}

const appVersion = process.env.npm_package_version || "0.0.0"
const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const builtAt = new Date().toISOString()
let resolvedOutDir = path.resolve(__dirname, "dist")

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    TanStackRouterVite(),  // Must be before react()
    react(),
    tailwindcss(),
    {
      name: "bff-dev-server",
      apply: "serve",
      configureServer(server) {
        let bffProcess: ChildProcess | null = null
        let startedByVite = false

        const stopBff = () => {
          if (!startedByVite || !bffProcess || bffProcess.killed) return
          bffProcess.kill()
          bffProcess = null
        }

        server.httpServer?.once("listening", async () => {
          if (await isBffRunning()) {
            server.config.logger.info(`BFF already running at http://127.0.0.1:${BFF_PORT}`)
            return
          }

          server.config.logger.info(`Starting BFF server on http://127.0.0.1:${BFF_PORT}...`)
          bffProcess = spawn("bun", ["run", "server/index.ts"], {
            cwd: __dirname,
            env: {
              ...process.env,
              PORT: BFF_PORT,
              APIAMIS_BASE_URL:
                process.env.APIAMIS_BASE_URL ||
                process.env.VITE_API_BASE_URL ||
                "http://apiamis.test/api",
            },
            stdio: "inherit",
          })
          startedByVite = true

          for (let attempt = 0; attempt < 20; attempt += 1) {
            if (await isBffRunning()) {
              server.config.logger.info(`BFF ready at http://127.0.0.1:${BFF_PORT}`)
              return
            }
            await new Promise((resolve) => setTimeout(resolve, 250))
          }

          server.config.logger.warn("BFF did not become ready — /bff requests may fail until it starts")
        })

        server.httpServer?.on("close", stopBff)
        process.on("exit", stopBff)
      },
    },
    {
      name: "docs-index-redirect",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] ?? ""
          if (url === "/docs" || url === "/docs/") {
            const query = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""
            res.statusCode = 302
            res.setHeader("Location", `/docs/index.html${query}`)
            res.end()
            return
          }
          next()
        })
      },
    },
    {
      name: "landing-performance",
      apply: "build",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          let output = html

          if (!output.includes('id="landing-critical-css"')) {
            output = output.replace(
              "</head>",
              `<style id="landing-critical-css">${LANDING_CRITICAL_CSS}</style>\n</head>`,
            )
          }

          output = output.replace(
            /<link rel="stylesheet"(?:\s+crossorigin)?\s+href="(\/assets\/[^"]+\.css)">/g,
            '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'" />\n  <noscript><link rel="stylesheet" href="$1" /></noscript>',
          )

          return output
        },
      },
    },
    {
      name: "generate-version-json",
      enforce: "post",
      configResolved(config) {
        resolvedOutDir = path.resolve(config.root, config.build.outDir)
      },
      // We also transform index.html to embed build info as meta tags.
      // This lets the browser know the current build ID as soon as HTML arrives,
      // even before any JS runs.
      transformIndexHtml(html) {
        const metaTags = `
    <meta name="app-version" content="${appVersion}" />
    <meta name="app-build-id" content="${buildId}" />
    <meta name="app-built-at" content="${builtAt}" />`

        // Insert right before </head>
        return html.replace('</head>', `${metaTags}\n</head>`)
      },
      // closeBundle runs after Vite copies /public — avoids stale public/version.json winning.
      closeBundle() {
        const versionPayload = {
          version: appVersion,
          buildId,
          builtAt,
        }

        mkdirSync(resolvedOutDir, { recursive: true })
        writeFileSync(
          path.join(resolvedOutDir, "version.json"),
          JSON.stringify(versionPayload, null, 2),
        )
      },
    },
  ],
  preview: {
    proxy: {
      '/bff': {
        target: `http://127.0.0.1:${BFF_PORT}`,
        changeOrigin: true,
      },
    },
  },
  server: {
    proxy: {
      '/office': {
        target: `http://127.0.0.1:${BFF_PORT}`,
        changeOrigin: true,
        ws: true,
      },
      '/bff': {
        target: `http://127.0.0.1:${BFF_PORT}`,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (_error, _req, res) => {
            if (!res || res.headersSent) return
            res.writeHead(502, { "Content-Type": "application/json" })
            res.end(JSON.stringify({
              message: "BFF server tidak berjalan. Jalankan `bun run dev` atau `bun run dev:server`.",
            }))
          })
        },
      },
      '/pengawasan': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // TanStack libraries
          'vendor-tanstack': ['@tanstack/react-router', '@tanstack/react-query'],
          // UI libraries
          'vendor-radix': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          // Heavy libraries - loaded separately
          'vendor-handsontable': ['handsontable', '@handsontable/react', 'hyperformula'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'vendor-xlsx': ['xlsx'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
        },
      },
    },
    // Increase chunk size warning limit since we're splitting intentionally
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
})
