/**
 * Katalog halaman Fumadocs (docs-site/content/docs/*.mdx).
 * Ini sumber statis yang di-build ke /docs/* — BUKAN tabel panduan_pages (CMS).
 */
import meta from '../../../../docs-site/content/docs/meta.json'

export type StaticDocEntry = {
    slug: string
    title: string
    description: string
    section: string
    href: string
    /** Body markdown tanpa frontmatter (bila berhasil di-load di build) */
    body: string
}

type MetaFile = {
    title?: string
    pages?: string[]
}

const mdxModules = import.meta.glob('../../../../docs-site/content/docs/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): {
    title?: string
    description?: string
    body: string
} {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) return { body: raw.trim() }

    const fm = match[1] ?? ''
    const body = (match[2] ?? '').trim()
    const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    const descMatch = fm.match(/^description:\s*["']?(.*?)["']?\s*$/m)
    const title = titleMatch?.[1]?.replace(/^["']|["']$/g, '').trim()
    const description = descMatch?.[1]?.replace(/^["']|["']$/g, '').trim()

    return { title, description, body }
}

function humanizeSlug(slug: string): string {
    return slug
        .split('-')
        .map((w) => (w.length ? w[0]!.toUpperCase() + w.slice(1) : w))
        .join(' ')
}

function sectionFromSeparator(label: string): string {
    const key = label.replace(/^---+|---+$/g, '').trim().toLowerCase()
    if (key.includes('mulai')) return 'mulai'
    if (key.includes('modul')) return 'modul'
    if (key.includes('integrasi')) return 'integrasi'
    if (key.includes('kolaborasi')) return 'kolaborasi'
    if (key.includes('administrasi')) return 'admin'
    if (key.includes('referensi')) return 'referensi'
    return 'umum'
}

function resolveMdxRaw(slug: string): string | null {
    const suffix = `/docs/${slug}.mdx`
    const hit = Object.entries(mdxModules).find(([path]) => path.replace(/\\/g, '/').endsWith(suffix))
    return hit ? hit[1] : null
}

/** Semua halaman MDX yang terdaftar di meta.json (bukan folder CMS). */
export function getStaticDocsCatalog(): StaticDocEntry[] {
    const pages = (meta as MetaFile).pages ?? []
    let section = 'umum'
    const out: StaticDocEntry[] = []

    for (const entry of pages) {
        if (entry.startsWith('---')) {
            section = sectionFromSeparator(entry)
            continue
        }
        const raw = resolveMdxRaw(entry)
        const parsed = raw ? parseFrontmatter(raw) : { body: '' }
        out.push({
            slug: entry,
            title: parsed.title || humanizeSlug(entry),
            description: parsed.description || '',
            section,
            href: `/docs/${entry}`,
            body: parsed.body || (raw ? parseFrontmatter(raw).body : `# ${humanizeSlug(entry)}\n`),
        })
    }

    return out
}
