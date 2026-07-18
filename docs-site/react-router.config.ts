import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

/**
 * SPA (`ssr: false`) still needs a `prerender` config so route `loader`s are
 * valid (pure SPA forbids server loaders). Prerender all docs + llms paths.
 *
 * DOCS_PRERENDER=minimal — only shell routes (lower memory; other pages need
 * client navigation + may miss loader data). Prefer full in production.
 */
const mode = process.env.DOCS_PRERENDER === 'minimal' ? 'minimal' : 'full';

export default {
  ssr: false,
  async prerender({ getStaticPaths }) {
    if (mode === 'minimal') {
      return ['/', '/docs'];
    }

    const paths: string[] = ['/docs'];
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
} satisfies Config;
