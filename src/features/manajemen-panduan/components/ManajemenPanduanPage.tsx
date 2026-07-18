import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    BookOpen,
    ExternalLink,
    FileCode2,
    Info,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    createPanduan,
    deletePanduan,
    fetchAdminPanduan,
    seedPanduanDefaults,
} from '../api'
import type { PanduanPage } from '../types'
import { PANDUAN_SECTIONS } from '../types'
import { getStaticDocsCatalog, type StaticDocEntry } from '../lib/static-docs-catalog'

export default function ManajemenPanduanPage() {
    const [pages, setPages] = useState<PanduanPage[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [staticSearch, setStaticSearch] = useState('')
    const [seeding, setSeeding] = useState(false)
    const [importingSlug, setImportingSlug] = useState<string | null>(null)

    const staticCatalog = useMemo(() => getStaticDocsCatalog(), [])

    const load = useCallback(async () => {
        setLoading(true)
        try {
            // Full list (filter di client) agar status “sudah di CMS” akurat vs katalog MDX
            const data = await fetchAdminPanduan()
            setPages(data)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat panduan')
            setPages([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void load()
    }, [load])

    const sectionLabel = useMemo(() => {
        const map = new Map<string, string>(PANDUAN_SECTIONS.map((s) => [s.value, s.label]))
        return (section: string) => map.get(section) ?? section
    }, [])

    const cmsSlugs = useMemo(() => new Set(pages.map((p) => p.slug)), [pages])

    const filteredCms = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return pages
        return pages.filter(
            (p) =>
                p.slug.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q) ||
                (p.description ?? '').toLowerCase().includes(q),
        )
    }, [pages, search])

    const filteredStatic = useMemo(() => {
        const q = staticSearch.trim().toLowerCase()
        if (!q) return staticCatalog
        return staticCatalog.filter(
            (p) =>
                p.slug.toLowerCase().includes(q) ||
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q),
        )
    }, [staticCatalog, staticSearch])

    const handleSeed = async (force: boolean) => {
        setSeeding(true)
        try {
            const res = await seedPanduanDefaults(force)
            toast.success(res.message)
            await load()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Seed gagal')
        } finally {
            setSeeding(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deletePanduan(id)
            toast.success('Halaman dihapus')
            await load()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal menghapus')
        }
    }

    const handleImportStatic = async (entry: StaticDocEntry) => {
        if (cmsSlugs.has(entry.slug)) {
            toast.message('Slug sudah ada di CMS — buka edit untuk mengubah.')
            return
        }
        setImportingSlug(entry.slug)
        try {
            await createPanduan({
                slug: entry.slug,
                title: entry.title,
                description: entry.description || null,
                section: entry.section || 'umum',
                sort_order: 100,
                body: entry.body || `# ${entry.title}\n`,
                is_published: false,
            })
            toast.success(`“${entry.title}” diimpor ke CMS (draf). Edit lalu terbitkan.`)
            await load()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Import gagal')
        } finally {
            setImportingSlug(null)
        }
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <BookOpen className="h-6 w-6" />
                            Manajemen Panduan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            CMS dinamis untuk halaman di{' '}
                            <code className="text-xs">/docs/cms/&lt;slug&gt;</code>. File MDX di repo
                            tidak otomatis masuk daftar ini.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Muat ulang
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={seeding}
                            onClick={() => void handleSeed(false)}
                        >
                            {seeding ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="mr-2 h-4 w-4" />
                            )}
                            Seed contoh CMS
                        </Button>
                        <Button asChild size="sm">
                            <Link to="/manajemen-panduan/baru">
                                <Plus className="mr-2 h-4 w-4" />
                                Halaman CMS baru
                            </Link>
                        </Button>
                    </div>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Dua sumber panduan (sengaja terpisah)</AlertTitle>
                    <AlertDescription className="space-y-2 text-sm">
                        <p>
                            <strong>1. Fumadocs MDX</strong> — file di{' '}
                            <code className="text-xs">docs-site/content/docs/*.mdx</code>, di-build ke{' '}
                            <code className="text-xs">/docs/auth</code>,{' '}
                            <code className="text-xs">/docs/pekerjaan-output</code>, dll. Ubah lewat
                            git/PR + rebuild, bukan lewat form ini.
                        </p>
                        <p>
                            <strong>2. CMS database</strong> — tabel <code className="text-xs">panduan_pages</code>
                            , diedit di sini, tampil di{' '}
                            <code className="text-xs">/docs/cms/&lt;slug&gt;</code> tanpa rebuild Docker.
                            Tombol “Seed” hanya membuat 2 halaman contoh CMS, bukan mengimpor semua MDX.
                        </p>
                    </AlertDescription>
                </Alert>

                {/* —— CMS (database) —— */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Halaman CMS (database)</CardTitle>
                        <CardDescription>
                            Status <strong>Terbit</strong> → publik di{' '}
                            <code className="text-xs">/docs/cms/&lt;slug&gt;</code> dan API{' '}
                            <code className="text-xs">/bff/api/panduan</code>.
                        </CardDescription>
                        <div className="max-w-sm pt-2">
                            <Input
                                placeholder="Cari judul atau slug CMS…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : pages.length === 0 ? (
                            <div className="space-y-3 py-12 text-center text-muted-foreground">
                                <p>Belum ada halaman di database CMS.</p>
                                <p className="text-xs">
                                    Itu normal. MDX di <code>docs-site</code> tidak muncul di sini sampai
                                    diimpor atau dibuat manual.
                                </p>
                                <Button variant="secondary" onClick={() => void handleSeed(false)} disabled={seeding}>
                                    Isi 2 contoh CMS
                                </Button>
                            </div>
                        ) : filteredCms.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Tidak ada CMS yang cocok dengan pencarian.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judul</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Diperbarui</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCms.map((page) => (
                                            <TableRow key={page.id}>
                                                <TableCell className="max-w-[220px] font-medium">
                                                    <div className="truncate" title={page.title}>
                                                        {page.title}
                                                    </div>
                                                    {page.description ? (
                                                        <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                                                            {page.description}
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs">{page.slug}</code>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {sectionLabel(page.section)}
                                                </TableCell>
                                                <TableCell>
                                                    {page.is_published ? (
                                                        <Badge>Terbit</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Draf</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {page.updated_at
                                                        ? new Date(page.updated_at).toLocaleString('id-ID')
                                                        : '—'}
                                                    {page.editor?.name ? <div>{page.editor.name}</div> : null}
                                                </TableCell>
                                                <TableCell className="space-x-1 text-right">
                                                    {page.is_published ? (
                                                        <Button variant="ghost" size="icon" asChild title="Buka publik">
                                                            <a
                                                                href={`/docs/cms/${page.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    ) : null}
                                                    <Button variant="ghost" size="icon" asChild title="Edit">
                                                        <Link
                                                            to="/manajemen-panduan/$id"
                                                            params={{ id: String(page.id) }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" title="Hapus">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus halaman?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    “{page.title}” akan dihapus permanen dari CMS.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => void handleDelete(page.id)}
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* —— Static MDX —— */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileCode2 className="h-4 w-4" />
                            Halaman MDX bawaan (Fumadocs)
                        </CardTitle>
                        <CardDescription>
                            Dari <code className="text-xs">docs-site/content/docs</code> ·{' '}
                            {staticCatalog.length} halaman. Baca di{' '}
                            <code className="text-xs">/docs/&lt;slug&gt;</code>. Impor ke CMS bila ingin
                            diedit lewat dashboard (disimpan sebagai draf).
                        </CardDescription>
                        <div className="max-w-sm pt-2">
                            <Input
                                placeholder="Cari MDX…"
                                value={staticSearch}
                                onChange={(e) => setStaticSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredStatic.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Tidak ada MDX yang cocok (atau meta.json kosong di build).
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judul</TableHead>
                                            <TableHead>Slug / path</TableHead>
                                            <TableHead>Section</TableHead>
                                            <TableHead>CMS</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStatic.map((entry) => {
                                            const inCms = cmsSlugs.has(entry.slug)
                                            return (
                                                <TableRow key={entry.slug}>
                                                    <TableCell className="max-w-[240px] font-medium">
                                                        <div className="truncate" title={entry.title}>
                                                            {entry.title}
                                                        </div>
                                                        {entry.description ? (
                                                            <div className="max-w-[240px] truncate text-xs text-muted-foreground">
                                                                {entry.description}
                                                            </div>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-xs">{entry.slug}</code>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            {entry.href}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {sectionLabel(entry.section)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {inCms ? (
                                                            <Badge variant="outline">Sudah di CMS</Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Hanya MDX</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="space-x-1 text-right">
                                                        <Button variant="ghost" size="icon" asChild title="Buka /docs">
                                                            <a href={entry.href} target="_blank" rel="noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        {inCms ? (
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link
                                                                    to="/manajemen-panduan/$id"
                                                                    params={{
                                                                        id: String(
                                                                            pages.find((p) => p.slug === entry.slug)
                                                                                ?.id,
                                                                        ),
                                                                    }}
                                                                >
                                                                    Edit CMS
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={importingSlug === entry.slug}
                                                                onClick={() => void handleImportStatic(entry)}
                                                            >
                                                                {importingSlug === entry.slug ? (
                                                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                                                ) : null}
                                                                Import ke CMS
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    )
}
