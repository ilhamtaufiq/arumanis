export type SeoMetaInput = {
  title: string
  description: string
  image: string
  url: string
  type?: string
  robots?: string
}

export type BlogPost = {
  title?: string | null
  content?: string | null
  cover_image?: string | null
}

export type BlogResponse = {
  data?: BlogPost
}

const DEFAULT_TITLE = 'Arumanis — Portal Air Minum & Sanitasi Kabupaten Cianjur'
const DEFAULT_DESCRIPTION =
  'Portal informasi publik capaian layanan air minum dan sanitasi Kabupaten Cianjur. Peta interaktif, data per desa, publikasi, dan dokumen terbuka.'
const DEFAULT_IMAGE_PATH = '/arumanis.svg'
const PUSPEN_TITLE = 'Puspen Arumanis'
const PUSPEN_DESCRIPTION =
  'Ruang kerja publikasi, media sharing, PDF, dan progress fisik Puspen Arumanis.'

export function getSiteUrl() {
  return (Bun.env.PUBLIC_SITE_URL || 'https://arumanis.cianjur.space').replace(/\/$/, '')
}

export function getApiBaseUrl() {
  return (Bun.env.APIAMIS_BASE_URL || Bun.env.VITE_API_BASE_URL || 'https://apiamis.cianjur.space/api').replace(
    /\/$/,
    '',
  )
}

export function getDefaultSeoMeta(siteUrl = getSiteUrl()): SeoMetaInput {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    image: `${siteUrl}${DEFAULT_IMAGE_PATH}`,
    url: `${siteUrl}/`,
    type: 'website',
  }
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function absoluteImageUrl(
  value: string | null | undefined,
  siteUrl = getSiteUrl(),
  apiBaseUrl = getApiBaseUrl(),
) {
  const fallback = `${siteUrl}${DEFAULT_IMAGE_PATH}`
  if (!value || value.startsWith('data:')) return fallback
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${siteUrl}${value}`

  try {
    return new URL(value, `${apiBaseUrl}/`).toString()
  } catch {
    return fallback
  }
}

export function buildMetaTags(meta: SeoMetaInput) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image)
  const url = escapeHtml(meta.url)
  const type = escapeHtml(meta.type || 'website')
  const robots = meta.robots ? `\n  <meta name="robots" content="${escapeHtml(meta.robots)}" />` : ''

  return `
  <title>${title}</title>
  <meta name="title" content="${title}" />
  <meta name="description" content="${description}" />${robots}
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${url}" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${description}" />
  <meta property="twitter:image" content="${image}" />`
}

export function replaceMetaTags(html: string, metaTags: string) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(
      /\s*<meta\s+(?:name|property)=["'](?:title|description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
      '\n',
    )
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, '\n')
    .replace('</head>', `${metaTags}\n</head>`)
}

export function injectMetaIntoHtml(html: string, meta: SeoMetaInput) {
  return replaceMetaTags(html, buildMetaTags(meta))
}

export async function buildPublikasiHtml(slug: string, pathname: string, indexHtml: string) {
  const siteUrl = getSiteUrl()
  const apiBaseUrl = getApiBaseUrl()
  const canonicalUrl = `${siteUrl}${pathname}`
  const defaults = getDefaultSeoMeta(siteUrl)

  try {
    const response = await fetch(`${apiBaseUrl}/blog/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Blog API returned ${response.status}`)
    }

    const payload = (await response.json()) as BlogResponse
    const post = payload.data
    const title = post?.title?.trim() || defaults.title
    const description = stripHtml(post?.content || '').slice(0, 160) || defaults.description
    const image = absoluteImageUrl(post?.cover_image, siteUrl, apiBaseUrl)

    return injectMetaIntoHtml(indexHtml, {
      title,
      description,
      image,
      url: canonicalUrl,
      type: 'article',
    })
  } catch (error) {
    console.error('Failed to inject publikasi OG meta:', error)
    return injectMetaIntoHtml(indexHtml, {
      ...defaults,
      url: canonicalUrl,
    })
  }
}

export function buildPublikasiListHtml(indexHtml: string) {
  const siteUrl = getSiteUrl()

  return injectMetaIntoHtml(indexHtml, {
    title: 'Arumanis Publikasi — Berita & Dokumentasi Air Minum dan Sanitasi',
    description:
      'Berita, galeri, informasi publik, dan dokumentasi resmi seputar pembangunan infrastruktur air minum dan sanitasi Kabupaten Cianjur.',
    image: `${siteUrl}${DEFAULT_IMAGE_PATH}`,
    url: `${siteUrl}/publikasi`,
    type: 'website',
  })
}

export function buildPuspenHtml(pathname: string, indexHtml: string) {
  const siteUrl = getSiteUrl()
  const canonicalUrl = `${siteUrl}${pathname}`

  return injectMetaIntoHtml(indexHtml, {
    title: PUSPEN_TITLE,
    description: PUSPEN_DESCRIPTION,
    image: `${siteUrl}${DEFAULT_IMAGE_PATH}`,
    url: canonicalUrl,
    type: 'website',
    robots: 'noindex, nofollow',
  })
}
