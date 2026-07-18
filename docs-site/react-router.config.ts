import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

/** Set DOCS_PRERENDER=0 for SPA-only client build (no entry.server prerender). */
const skipPrerender = process.env.DOCS_PRERENDER === '0';

export default {
  ssr: false,
  ...(skipPrerender
    ? {}
    : {
        async prerender({ getStaticPaths }) {
          const paths: string[] = ['/docs']; // Coolify-style home (empty slug)
          const excluded: string[] = [];

          for (const path of getStaticPaths()) {
            if (!excluded.includes(path)) paths.push(path);
          }

          for await (const entry of glob('**/*.{md,mdx}', { cwd: 'content/docs' })) {
            if (entry.includes('meta.json')) continue;
            const slugs = getSlugs(entry);
            paths.push(getUrl(slugs));
            paths.push(`/llms.mdx/docs/${[...slugs, 'content.md'].join('/')}`);
          }

          return [...new Set(paths)];
        },
      }),
} satisfies Config;
