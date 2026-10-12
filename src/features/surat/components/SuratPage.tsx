import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
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
    const [cari, setCari] = useState('')
    const [page, setPage] = useState(1)
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Surat | null>(null)
    const [deleting, setDeleting] = useState<Surat | null>(null)

    const { data, isLoading, isFetching } = useSuratList({ tahun, search: cari, page, per_page: PER_PAGE })
    const deleteMutation = useDeleteSurat()
    const rows = data?.data ?? []
    const meta = data?.meta

    const terapkanCari = () => {
        setCari(search.trim())
        setPage(1)
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
                    className="flex min-w-0 flex-1 gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        terapkanCari()
                    }}
                >
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nomor, perihal, atau tujuan"
                        aria-label="Cari surat"
                    />
                    <Button type="submit" variant="outline" disabled={isFetching}>
                        <Search className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Cari</span>
                    </Button>
                </form>
            </div>

            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-4">
                            <TableSkeleton rows={6} columns={6} />
                        </div>
                    ) : rows.length === 0 ? (
                        <p className="py-12 text-center text-sm text-muted-foreground">
                            {cari
                                ? `Tidak ada surat yang cocok dengan "${cari}" pada ${tahun}.`
                                : `Belum ada surat pada ${tahun}.`}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
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
                                                    <span className="break-all">{surat.nomor}</span>
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
