import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import mdx from 'fumadocs-mdx/vite';

/**
 * Build without path base so React Router prerender stays stable.
 * `scripts/copy-docs-dist.mjs` rewrites `/assets` → `/docs/assets` and
 * flattens `build/client/docs/**` into monorepo `dist/docs/**`.
 *
 * Preview binds to 127.0.0.1 (not localhost) so prerender HTTP in Alpine
 * Docker does not hit IPv6 ::1 while the server only listens on IPv4.
 */
export default defineConfig({
  plugins: [mdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  preview: {
    host: '127.0.0.1',
    strictPort: true,
  },
  server: {
    host: '127.0.0.1',
  },
});
