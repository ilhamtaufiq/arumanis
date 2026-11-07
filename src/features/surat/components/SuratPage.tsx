import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Copy, FileText, Hash, Loader2, Plus, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { AccessPageShell } from '@/components/shared/AccessSecurityShell'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { ListPagination } from '@/components/shared/ListPagination'
import { ListRowActions } from '@/components/shared/ListRowActions'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useDebounce } from '@/hooks/use-debounce'
import { useDeleteSurat, useSuratList } from '../hooks/useSurat'
import type { Surat } from '../types'
import { SuratFormDialog } from './SuratFormDialog'

const PER_PAGE = 20
const tanggalFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function formatTanggal(iso: string) {
    const [y, m, d] = iso.split('-').map(Number)
    return tanggalFormatter.format(new Date(y, m - 1, d))
}

export default function SuratPage() {
    const tahunIni = new Date().getFullYear()
    const tahunOpsi = useMemo(() => Array.from({ length: 8 }, (_, i) => tahunIni + 1 - i), [tahunIni])

    const [tahun, setTahun] = useState(tahunIni)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    // Pencarian berjalan otomatis setelah berhenti mengetik, tanpa harus menekan tombol Cari.
    const cari = useDebounce(search.trim(), 300)
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Surat | null>(null)
    const [deleting, setDeleting] = useState<Surat | null>(null)

    const { data, isLoading, isFetching } = useSuratList({ tahun, search: cari, page, per_page: PER_PAGE })
    const deleteMutation = useDeleteSurat()
    const rows = data?.data ?? []
    const meta = data?.meta
    // Daftar diurutkan dari tanggal terbaru, jadi baris pertama halaman 1 tanpa pencarian adalah nomor terbaru.
    const terbaru = page === 1 && !cari ? rows[0] : undefined

    const ubahCari = (nilai: string) => {
        setSearch(nilai)
        setPage(1)
    }

    const salinNomor = async (nomor: string) => {
        try {
            await navigator.clipboard.writeText(nomor)
            toast.success(`Nomor ${nomor} disalin`)
        } catch {
            toast.error('Nomor tidak bisa disalin. Salin manual dari tabel.')
        }
    }

    const bukaBaru = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const bukaUbah = (surat: Surat) => {
        setEditing(surat)
        setFormOpen(true)
    }

    const hapus = () => {
        if (!deleting) return
        deleteMutation.mutate(deleting.id, {
            onSuccess: () => {
                toast.success(`Surat ${deleting.nomor} dihapus`)
                setDeleting(null)
            },
            onError: (error) => toast.error(getApiErrorMessage(error, 'Gagal menghapus surat')),
        })
    }

    return (
        <AccessPageShell
            title="Penomoran Surat"
            description="Nomor surat terpusat. Surat boleh terkait pekerjaan, boleh juga tidak."
            actions={
                <Button type="button" onClick={bukaBaru}>
                    <Plus className="mr-2 h-4 w-4" />
                    Surat baru
                </Button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Surat tahun {tahun}</p>
                            <p className="text-xl font-semibold tabular-nums">{meta?.total ?? '—'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Hash className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Nomor terbaru</p>
                            <p className="truncate font-mono text-sm font-medium" title={terbaru?.nomor}>
                                {terbaru ? terbaru.nomor : '—'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={String(tahun)}
                    onValueChange={(v) => {
                        setTahun(Number(v))
                        setPage(1)
                    }}
                >
                    <SelectTrigger className="w-32" aria-label="Tahun surat">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {tahunOpsi.map((t) => (
                            <SelectItem key={t} value={String(t)}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <form
                    className="relative min-w-0 flex-1"
                    onSubmit={(e) => e.preventDefault()}
                    role="search"
                >
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        value={search}
                        onChange={(e) => ubahCari(e.target.value)}
                        placeholder="Cari nomor, perihal, atau tujuan"
                        aria-label="Cari surat"
                        className="pl-9 pr-16"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Memuat" />}
                        {search && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => ubahCari('')}
                                aria-label="Hapus pencarian"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4">
                            <TableSkeleton rows={6} columns={6} />
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                {cari
                                    ? `Tidak ada surat yang cocok dengan "${cari}" pada ${tahun}.`
                                    : `Belum ada surat pada ${tahun}.`}
                            </p>
                            {cari ? (
                                <Button type="button" variant="outline" size="sm" onClick={() => ubahCari('')}>
                                    Hapus pencarian
                                </Button>
                            ) : (
                                <Button type="button" size="sm" onClick={bukaBaru}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat surat pertama
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div
                            className={`overflow-x-auto transition-opacity ${isFetching ? 'opacity-60' : ''}`}
                            aria-busy={isFetching}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">No</TableHead>
                                        <TableHead>Nomor</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="min-w-64">Perihal</TableHead>
                                        <TableHead>Tujuan</TableHead>
                                        <TableHead>Pekerjaan</TableHead>
                                        <TableHead className="w-24 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((surat) => (
                                        <TableRow key={surat.id}>
                                            <TableCell className="tabular-nums">{surat.sequence_number}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="break-all font-mono text-sm">{surat.nomor}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0 text-muted-foreground"
                                                            onClick={() => void salinNomor(surat.nomor)}
                                                            aria-label={`Salin nomor ${surat.nomor}`}
                                                            title="Salin nomor"
                                                        >
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                    <Badge variant="secondary" className="block w-fit">
                                                        {surat.jenis.code}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{formatTanggal(surat.tanggal)}</TableCell>
                                            <TableCell className="whitespace-normal">{surat.perihal}</TableCell>
                                            <TableCell className="whitespace-normal text-muted-foreground">
                                                {surat.tujuan || '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-normal">
                                                {surat.pekerjaan?.nama_paket ?? (
                                                    <span className="text-muted-foreground">Umum</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <ListRowActions
                                                    edit={
                                                        <Button variant="ghost" size="sm" onClick={() => bukaUbah(surat)}>
                                                            Ubah
                                                        </Button>
                                                    }
                                                    onDelete={() => setDeleting(surat)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {meta && meta.last_page > 1 && (
                <ListPagination
                    page={page}
                    totalPages={meta.last_page}
                    onPageChange={setPage}
                    disabled={isFetching}
                    meta={{ total: meta.total }}
                />
            )}

            {formOpen && (
                <SuratFormDialog
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    surat={editing}
                    defaultTahun={tahun}
                />
            )}

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                entityName={deleting ? `surat ${deleting.nomor}` : 'surat'}
                description="Nomor yang sudah terpakai tidak dipakai ulang, sehingga akan ada celah di deret nomor tahun ini."
                onConfirm={hapus}
                isPending={deleteMutation.isPending}
            />
        </AccessPageShell>
    )
}
