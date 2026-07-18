import type { Route } from './+types/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { getPageMarkdownUrl, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { useMDXComponents } from '@/components/mdx';
import { DocsHomePage } from '@/components/docs-home';
import { fetchCmsPanduanBySlug, type CmsPanduanPage } from '@/lib/panduan-api';
import { CmsPanduanView } from '@/components/cms-panduan-view';

type SerializedPageTree = Awaited<ReturnType<typeof source.serializePageTree>>;

async function safePageTree(): Promise<SerializedPageTree> {
  try {
    return await source.serializePageTree(source.getPageTree());
  } catch (err) {
    console.error('[docs loader] serializePageTree failed:', err);
    // Empty tree keeps layout mountable if SSR/edge render fails in some runtimes.
    return {
      $fumadocs_loader: 'page-tree',
      data: { name: 'Docs', children: [] },
    } as SerializedPageTree;
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = (params['*'] ?? '').split('/').filter((v) => v.length > 0);

  // /docs  → Coolify-style marketing home (no page tree needed for DocsHomePage)
  if (slugs.length === 0) {
    return {
      kind: 'home' as const,
      path: '',
      markdownUrl: '',
      pageTree: null as SerializedPageTree | null,
      cmsPage: null as CmsPanduanPage | null,
    };
  }

  // /docs/cms/:slug → content from API (admin CMS)
  if (slugs[0] === 'cms' && slugs[1]) {
    const cmsPage = await fetchCmsPanduanBySlug(slugs[1]);
    if (!cmsPage) throw new Response('Not found', { status: 404 });
    return {
      kind: 'cms' as const,
      path: `cms/${slugs[1]}`,
      markdownUrl: '',
      pageTree: await safePageTree(),
      cmsPage,
    };
  }

  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  return {
    kind: 'page' as const,
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    pageTree: await safePageTree(),
    cmsPage: null as CmsPanduanPage | null,
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx },
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs-site/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <Mdx components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  if (loaderData.kind === 'home') {
    return <DocsHomePage />;
  }

  return <DocsInner loaderData={loaderData} />;
}

/** Separate component so hooks stay unconditional (home returns above). */
function DocsInner({
  loaderData,
}: {
  loaderData: Extract<Route.ComponentProps['loaderData'], { kind: 'cms' | 'page' }>;
}) {
  const { pageTree } = useFumadocsLoader(loaderData);

  if (loaderData.kind === 'cms' && loaderData.cmsPage) {
    return (
      <DocsLayout {...baseOptions()} tree={pageTree}>
        <CmsPanduanView page={loaderData.cmsPage} />
      </DocsLayout>
    );
  }

  return (
    <DocsLayout {...baseOptions()} tree={pageTree}>
      {clientLoader.useContent(loaderData.path, {
        markdownUrl: loaderData.markdownUrl,
        path: loaderData.path,
      })}
    </DocsLayout>
  );
}
