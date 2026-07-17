import type { Config } from '@react-router/dev/config';
import { glob } from 'node:fs/promises';
import { createGetUrl, getSlugs } from 'fumadocs-core/source';

const getUrl = createGetUrl('/docs');

export default {
  ssr: false,
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
} satisfies Config;
