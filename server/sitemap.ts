import { getApiBaseUrl, getSiteUrl } from './seo-meta.ts'

type BlogListItem = {
  slug?: string | null
  is_published?: boolean
  is_internal?: boolean
  updated_at?: string | null
  published_at?: string | null
}

type BlogListResponse = {
  data?: BlogListItem[]
  meta?: {
    current_page?: number
    last_page?: number
  }
}

const STATIC_PATHS = [
  '/',
  '/publikasi',
  '/capaian-spm',
  '/tujuan-manfaat-hasil',
  '/rancang-bangun-inovasi',
  '/terms',
  '/privacy-policy',
] as const

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIsoDate(value: string | null | undefined) {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

async function fetchPublishedBlogSlugs(apiBaseUrl: string) {
  const slugs: Array<{ slug: string; lastmod?: string }> = []
  let page = 1
  let lastPage = 1

  do {
    const url = new URL(`${apiBaseUrl}/blog`)
    url.searchParams.set('published', '1')
    url.searchParams.set('page', String(page))

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Blog list API returned ${response.status}`)
    }

    const payload = (await response.json()) as BlogListResponse
    const posts = payload.data ?? []
    lastPage = payload.meta?.last_page ?? page

    for (const post of posts) {
      if (!post.slug || !post.is_published || post.is_internal) continue
      slugs.push({
        slug: post.slug,
        lastmod: toIsoDate(post.updated_at || post.published_at),
      })
    }

    page += 1
  } while (page <= lastPage)

  return slugs
}

export async function buildSitemapXml() {
  const siteUrl = getSiteUrl()
  const apiBaseUrl = getApiBaseUrl()
  const urls: Array<{ loc: string; lastmod?: string }> = STATIC_PATHS.map((path) => ({
    loc: path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`,
  }))

  try {
    const posts = await fetchPublishedBlogSlugs(apiBaseUrl)
    for (const post of posts) {
      urls.push({
        loc: `${siteUrl}/publikasi/${encodeURIComponent(post.slug)}`,
        lastmod: post.lastmod,
      })
    }
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error)
  }

  const body = urls
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}