import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import mdx from 'fumadocs-mdx/vite';

/**
 * Build without path base so React Router prerender stays stable.
 * `scripts/copy-docs-dist.mjs` rewrites `/assets` → `/docs/assets` and
 * flattens `build/client/docs/**` into monorepo `dist/docs/**`.
 */
export default defineConfig({
  plugins: [mdx(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
