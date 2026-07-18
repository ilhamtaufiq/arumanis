import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
    BookOpen,
    ExternalLink,
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
import {
    deletePanduan,
    fetchAdminPanduan,
    seedPanduanDefaults,
} from '../api'
import type { PanduanPage } from '../types'
import { PANDUAN_SECTIONS } from '../types'

export default function ManajemenPanduanPage() {
    const [pages, setPages] = useState<PanduanPage[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [seeding, setSeeding] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await fetchAdminPanduan({
                search: search.trim() || undefined,
            })
            setPages(data)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal memuat panduan')
            setPages([])
        } finally {
            setLoading(false)
        }
    }, [search])

    useEffect(() => {
        void load()
    }, [load])

    const sectionLabel = useMemo(() => {
        const map = new Map(PANDUAN_SECTIONS.map((s) => [s.value, s.label]))
        return (section: string) => map.get(section) ?? section
    }, [])

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

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            Manajemen Panduan
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola konten dokumentasi yang tampil di{' '}
                            <a href="/docs/" className="underline font-medium" target="_blank" rel="noreferrer">
                                /docs
                            </a>
                            . Perubahan langsung aktif tanpa rebuild Docker.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Muat ulang
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={seeding}
                            onClick={() => void handleSeed(false)}
                        >
                            {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            Seed default
                        </Button>
                        <Button asChild size="sm">
                            <Link to="/manajemen-panduan/baru">
                                <Plus className="h-4 w-4 mr-2" />
                                Halaman baru
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Daftar halaman</CardTitle>
                        <CardDescription>
                            Halaman berstatus <strong>Terbit</strong> dapat dibaca publik di{' '}
                            <code className="text-xs">/docs/cms/&lt;slug&gt;</code> dan API{' '}
                            <code className="text-xs">/bff/api/panduan</code>.
                        </CardDescription>
                        <div className="pt-2 max-w-sm">
                            <Input
                                placeholder="Cari judul atau slug…"
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
                            <div className="text-center py-12 text-muted-foreground space-y-3">
                                <p>Belum ada halaman panduan di database.</p>
                                <Button variant="secondary" onClick={() => void handleSeed(false)} disabled={seeding}>
                                    Isi contoh default
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
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
                                        {pages.map((page) => (
                                            <TableRow key={page.id}>
                                                <TableCell className="font-medium max-w-[220px]">
                                                    <div className="truncate" title={page.title}>
                                                        {page.title}
                                                    </div>
                                                    {page.description && (
                                                        <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                                                            {page.description}
                                                        </div>
                                                    )}
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
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {page.updated_at
                                                        ? new Date(page.updated_at).toLocaleString('id-ID')
                                                        : '—'}
                                                    {page.editor?.name ? (
                                                        <div>{page.editor.name}</div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    {page.is_published && (
                                                        <Button variant="ghost" size="icon" asChild title="Buka publik">
                                                            <a
                                                                href={`/docs/cms/${page.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" asChild title="Edit">
                                                        <Link to="/manajemen-panduan/$id" params={{ id: String(page.id) }}>
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
                                                                    “{page.title}” akan dihapus permanen.
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
            </div>
        </PageContainer>
    )
}
