import type { Route } from './+types/home';
import { DocsHomePage } from '@/components/docs-home';
import { brand, docsPageTitle } from '@/lib/brand';

export function meta({}: Route.MetaArgs) {
  return [
    { title: docsPageTitle() },
    { name: 'description', content: brand.description },
    { property: 'og:title', content: brand.docsTitle },
    { property: 'og:description', content: brand.description },
    { property: 'og:image', content: brand.ogImage },
    { property: 'og:url', content: brand.docsUrl },
  ];
}

export default function Home() {
  return <DocsHomePage />;
}
