import path from "path"
import { fileURLToPath } from "url"
import { writeFileSync } from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const appVersion = process.env.npm_package_version || "0.0.0"
const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const builtAt = new Date().toISOString()

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
      name: "generate-version-json",
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
      closeBundle() {
        const versionPayload = {
          version: appVersion,
          buildId,
          builtAt,
        }

        writeFileSync(
          path.resolve(__dirname, "dist/version.json"),
          JSON.stringify(versionPayload, null, 2),
        )
      },
    },
  ],
  server: {
    proxy: {
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
