export type PageMeta = {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: string
    robots?: string
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

const JSON_LD_ID = 'page-json-ld'

type RestorableState = {
    title: string
    meta: Map<string, string>
    canonical: string | null
    jsonLd: Element | null
}

function readMetaContent(selector: string) {
    return document.querySelector<HTMLMetaElement>(selector)?.getAttribute('content') ?? ''
}

function setMetaContent(selector: string, content: string | undefined) {
    if (!content) return
    const element = document.querySelector<HTMLMetaElement>(selector)
    if (element) {
        element.setAttribute('content', content)
    }
}

function setCanonical(url: string | undefined) {
    if (!url) return

    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
    }
    link.href = url
}

function setRobots(content: string | undefined) {
    if (!content) return

    let element = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!element) {
        element = document.createElement('meta')
        element.setAttribute('name', 'robots')
        document.head.appendChild(element)
    }
    element.setAttribute('content', content)
}

function clearRobots() {
    document.querySelector('meta[name="robots"]')?.remove()
}

function setJsonLd(jsonLd: PageMeta['jsonLd']) {
    document.getElementById(JSON_LD_ID)?.remove()
    if (!jsonLd) return

    const script = document.createElement('script')
    script.id = JSON_LD_ID
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
}

function captureRestorableState(): RestorableState {
    return {
        title: document.title,
        meta: new Map([
            ['meta[name="title"]', readMetaContent('meta[name="title"]')],
            ['meta[name="description"]', readMetaContent('meta[name="description"]')],
            ['meta[property="og:title"]', readMetaContent('meta[property="og:title"]')],
            ['meta[property="og:description"]', readMetaContent('meta[property="og:description"]')],
            ['meta[property="og:image"]', readMetaContent('meta[property="og:image"]')],
            ['meta[property="og:url"]', readMetaContent('meta[property="og:url"]')],
            ['meta[property="og:type"]', readMetaContent('meta[property="og:type"]')],
            ['meta[property="twitter:title"]', readMetaContent('meta[property="twitter:title"]')],
            ['meta[property="twitter:description"]', readMetaContent('meta[property="twitter:description"]')],
            ['meta[property="twitter:image"]', readMetaContent('meta[property="twitter:image"]')],
            ['meta[property="twitter:url"]', readMetaContent('meta[property="twitter:url"]')],
        ]),
        canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
        jsonLd: document.getElementById(JSON_LD_ID),
    }
}

function restoreState(state: RestorableState) {
    document.title = state.title
    for (const [selector, content] of state.meta.entries()) {
        setMetaContent(selector, content)
    }

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (state.canonical) {
        if (canonical) {
            canonical.href = state.canonical
        }
    } else {
        canonical?.remove()
    }

    clearRobots()
    document.getElementById(JSON_LD_ID)?.remove()
    if (state.jsonLd) {
        document.head.appendChild(state.jsonLd)
    }
}

export function applyPageMeta(meta: PageMeta) {
    const previous = captureRestorableState()

    if (meta.title) {
        document.title = meta.title
        setMetaContent('meta[name="title"]', meta.title)
        setMetaContent('meta[property="og:title"]', meta.title)
        setMetaContent('meta[property="twitter:title"]', meta.title)
    }

    if (meta.description) {
        setMetaContent('meta[name="description"]', meta.description)
        setMetaContent('meta[property="og:description"]', meta.description)
        setMetaContent('meta[property="twitter:description"]', meta.description)
    }

    if (meta.image) {
        setMetaContent('meta[property="og:image"]', meta.image)
        setMetaContent('meta[property="twitter:image"]', meta.image)
    }

    if (meta.url) {
        setMetaContent('meta[property="og:url"]', meta.url)
        setMetaContent('meta[property="twitter:url"]', meta.url)
        setCanonical(meta.url)
    }

    if (meta.type) {
        setMetaContent('meta[property="og:type"]', meta.type)
    }

    if (meta.robots) {
        setRobots(meta.robots)
    } else {
        clearRobots()
    }

    setJsonLd(meta.jsonLd)

    return () => restoreState(previous)
}

export function buildArticleJsonLd(input: {
    title: string
    description: string
    url: string
    image?: string
    datePublished?: string | null
    dateModified?: string | null
    authorName?: string | null
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.title,
        description: input.description,
        mainEntityOfPage: input.url,
        image: input.image ? [input.image] : undefined,
        datePublished: input.datePublished ?? undefined,
        dateModified: input.dateModified ?? undefined,
        author: input.authorName
            ? {
                  '@type': 'Person',
                  name: input.authorName,
              }
            : undefined,
        publisher: {
            '@type': 'Organization',
            name: 'Arumanis',
            logo: {
                '@type': 'ImageObject',
                url: 'https://arumanis.cianjur.space/arumanis.svg',
            },
        },
    }
}

export function resolvePublicAssetUrl(path: string) {
    if (/^https?:\/\//i.test(path)) return path
    if (path.startsWith('/')) return `${window.location.origin}${path}`
    return path
}

export function buildOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'GovernmentOrganization',
        name: 'Arumanis',
        url: 'https://arumanis.cianjur.space/',
        logo: 'https://arumanis.cianjur.space/arumanis.svg',
        description:
            'Portal informasi publik capaian layanan air minum dan sanitasi Kabupaten Cianjur.',
        areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Kabupaten Cianjur',
        },
    }
}