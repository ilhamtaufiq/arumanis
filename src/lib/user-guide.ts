/**
 * Data layer for docs/user-guide/ markdown files.
 * Uses Vite import.meta.glob to load .md as raw strings at build time.
 */
type GlobModules = Record<string, () => Promise<string>>

const rawModules: GlobModules = import.meta.glob(
    '../../docs/user-guide/*.md',
    {
        query: '?raw',
        import: 'default',
    },
) as GlobModules

const eagerRawModules: Record<string, string> =
    import.meta.glob('../../docs/user-guide/*.md', {
        query: '?raw',
        import: 'default',
        eager: true,
    }) as Record<string, string>

export type TocItem = {
    id: string
    text: string
    level: number
}

export type DocMeta = {
    slug: string
    title: string
    description: string
    filename: string
}

export type DocRecord = DocMeta & {
    content: string
    toc: TocItem[]
}

function extractTitle(md: string): string {
    const match = md.match(/^#\s+(.+)$/m)
    return match ? match[1].trim() : 'Tanpa Judul'
}

function extractDescription(md: string): string {
    const lines = md.split('\n')
    let afterH1 = false
    for (const line of lines) {
        if (line.startsWith('# ')) {
            afterH1 = true
            continue
        }
        if (afterH1 && line.trim() !== '' && !line.startsWith('#')) {
            return line.trim().replace(/^\*\*|\*\*/g, '').slice(0, 200)
        }
    }
    return ''
}

function extractToc(md: string): TocItem[] {
    const toc: TocItem[] = []
    const lines = md.split('\n')
    for (const line of lines) {
        const match = line.match(/^(#{2,4})\s+(.+)$/)
        if (match) {
            const level = match[1].length
            const text = match[2].trim()
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            toc.push({ id, text, level })
        }
    }
    return toc
}

function filenameToSlug(filename: string): string {
    const base = filename.replace(/\.md$/, '').replace(/\.mdx$/, '')
    return base.replace(/^\d+[-_]/, '').toLowerCase()
}

function getDocMeta(filename: string, content: string): DocMeta {
    const slug = filenameToSlug(filename)
    const title = extractTitle(content)
    const description = extractDescription(content)
    return { slug, title, description, filename }
}

export async function loadDoc(slug: string): Promise<DocRecord | null> {
    const entry = Object.entries(rawModules).find(([path]) => {
        const fn = path.split('/').pop() ?? ''
        return filenameToSlug(fn) === slug
    })
    if (!entry) return null
    try {
        const content = await entry[1]()
        const meta = getDocMeta(entry[0], content)
        const toc = extractToc(content)
        return { ...meta, content, toc }
    } catch {
        console.warn(`[user-guide] failed to load doc: ${slug}`)
        return null
    }
}

export function loadDocSync(slug: string): DocRecord | null {
    const entry = Object.entries(eagerRawModules).find(([path]) => {
        const fn = path.split('/').pop() ?? ''
        return filenameToSlug(fn) === slug
    })
    if (!entry) return null
    try {
        const content = entry[1]
        const meta = getDocMeta(entry[0], content)
        const toc = extractToc(content)
        return { ...meta, content, toc }
    } catch {
        console.warn(`[user-guide] failed to load doc sync: ${slug}`)
        return null
    }
}

export function getAllDocMeta(): DocMeta[] {
    const entries: DocMeta[] = Object.entries(eagerRawModules).map(
        ([path, content]) => {
            const filename = path.split('/').pop() ?? ''
            return getDocMeta(filename, content)
        },
    )
    entries.sort((a, b) => {
        if (a.slug === 'index') return -1
        if (b.slug === 'index') return 1
        return a.title.localeCompare(b.title, 'id')
    })
    return entries
}

export type NavSection = {
    title: string
    items: { title: string; slug: string }[]
}

export function getNavSections(docs: DocMeta[]): NavSection[] {
    const slugMap = new Map(docs.map((d) => [d.slug, d.title]))
    const sections: NavSection[] = [
        {
            title: 'Pendahuluan & Navigasi',
            items: [
                { title: 'Pendahuluan', slug: 'navigasi-global' },
                { title: 'Komponen UI Dasar', slug: 'komponen-ui-dasar' },
            ],
        },
        {
            title: 'Panduan per Modul',
            items: [
                { title: 'Auth', slug: 'auth' },
                { title: 'Dashboard', slug: 'dashboard' },
                { title: 'Kegiatan', slug: 'kegiatan' },
                { title: 'Desa & Kecamatan', slug: 'desa-kecamatan' },
                { title: 'Pekerjaan & Output', slug: 'pekerjaan-output' },
                { title: 'Kontrak', slug: 'kontrak' },
                { title: 'Penerima & Penyedia', slug: 'penerima-penyedia' },
                { title: 'Berkas & Foto', slug: 'berkas-foto' },
                { title: 'Users', slug: 'users' },
                { title: 'Roles & Permissions', slug: 'roles-permissions' },
                { title: 'Settings', slug: 'settings' },
                { title: 'SPAM Unit', slug: 'spam-unit' },
            ],
        },
        {
            title: 'Panduan Lintas Modul',
            items: [
                { title: 'Skenario Penggunaan', slug: 'skenario-penggunaan' },
                { title: 'Manajemen Akses', slug: 'manajemen-akses' },
                { title: 'Pemecahan Masalah', slug: 'pemecahan-masalah' },
                { title: 'Glosarium', slug: 'glosarium' },
            ],
        },
    ]
    return sections
        .map((s) => ({
            ...s,
            items: s.items.filter((item) => slugMap.has(item.slug)),
        }))
        .filter((s) => s.items.length > 0)
}
