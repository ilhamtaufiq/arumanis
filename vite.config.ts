import path from "path"
import { fileURLToPath } from "url"
import { spawn, type ChildProcess } from "node:child_process"
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig, type Connect, type Plugin } from "vite"

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
const DOCS_DIST = path.resolve(__dirname, "dist/docs")

function contentTypeForDev(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === ".html") return "text/html; charset=utf-8"
  if (ext === ".js" || ext === ".mjs") return "application/javascript; charset=utf-8"
  if (ext === ".css") return "text/css; charset=utf-8"
  if (ext === ".json") return "application/json; charset=utf-8"
  if (ext === ".svg") return "image/svg+xml"
  if (ext === ".png") return "image/png"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  if (ext === ".woff2") return "font/woff2"
  if (ext === ".txt" || ext === ".data" || ext === ".md") return "text/plain; charset=utf-8"
  return "application/octet-stream"
}

/** Dev middleware: serve Fumadocs from dist/docs under /docs/* */
function createFumadocsDevPlugin(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const rawUrl = req.url ?? ""
    const urlPath = rawUrl.split("?")[0] ?? ""
    const query = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : ""

    // Legacy Docsify (/docs/index.html#/…) — preserve hash via client redirect
    if (
      urlPath === "/docs/index.html" ||
      urlPath.startsWith("/docs/index.html/")
    ) {
      res.statusCode = 200
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.setHeader("Cache-Control", "no-cache")
      res.end(`<!doctype html><html lang="id"><head>
        <meta charset="utf-8"/>
        <title>Mengalihkan…</title>
        <script>
          var h = (location.hash || '').replace(/^#\\/?/, '');
          location.replace('/docs/' + (h ? h.replace(/^\\//, '') : ''));
        </script>
      </head><body><p>Mengalihkan ke <a href="/docs/">/docs/</a>…</p></body></html>`)
      return
    }

    if (urlPath !== "/docs" && !urlPath.startsWith("/docs/")) {
      next()
      return
    }

    if (!existsSync(DOCS_DIST)) {
      res.statusCode = 503
      res.setHeader("Content-Type", "text/html; charset=utf-8")
      res.end(`<!doctype html><html lang="id"><body style="font-family:system-ui;padding:2rem">
        <h1>Arumanis Docs belum di-build</h1>
        <p>Jalankan di terminal:</p>
        <pre style="background:#f4f4f4;padding:1rem;border-radius:8px">bun run docs:build</pre>
        <p>Lalu refresh halaman ini. Atau dev terpisah: <code>bun run docs:dev</code> → buka port docs-site.</p>
        <p><a href="/">← Kembali ke aplikasi</a></p>
      </body></html>`)
      return
    }

    // Map /docs → /  and /docs/foo → /foo inside dist/docs
    let rel =
      urlPath === "/docs" || urlPath === "/docs/"
        ? "/"
        : urlPath.slice("/docs".length) || "/"
    if (!rel.startsWith("/")) rel = `/${rel}`

    const candidate = path.resolve(DOCS_DIST, `.${rel}`)
    if (!candidate.startsWith(DOCS_DIST)) {
      res.statusCode = 404
      res.end("Not found")
      return
    }

    const tryPaths: string[] = []
    if (path.extname(candidate)) {
      tryPaths.push(candidate)
    } else {
      tryPaths.push(path.join(candidate, "index.html"))
      tryPaths.push(`${candidate}.html`)
    }
    tryPaths.push(path.join(DOCS_DIST, "__spa-fallback.html"))
    tryPaths.push(path.join(DOCS_DIST, "index.html"))

    for (const filePath of tryPaths) {
      if (!existsSync(filePath)) continue
      try {
        if (!statSync(filePath).isFile()) continue
      } catch {
        continue
      }
      res.statusCode = 200
      res.setHeader("Content-Type", contentTypeForDev(filePath))
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache")
      }
      createReadStream(filePath).pipe(res)
      return
    }

    res.statusCode = 404
    res.end("Docs page not found")
  }

  return {
    name: "serve-fumadocs-dev",
    configureServer(server) {
      // Run before Vite static/public so Docsify public/docs cannot win
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

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
    /**
     * Serve Fumadocs (dist/docs) during Vite dev — replaces old Docsify at public/docs.
     * Run `bun run docs:build` once (or after content changes). Redirects legacy
     * /docs/index.html#/ URLs to /docs/.
     */
    createFumadocsDevPlugin(),
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
      },
      // Arumanis GIS (www/arumanis-gis) — Vite :3100, BFF :3101 via its own proxy
      '/gis': {
        target: 'http://127.0.0.1:3100',
        changeOrigin: true,
        ws: true,
      },
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
