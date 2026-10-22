import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CalendarRange, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useDeleteInformasi, useInformasiList } from '../hooks/useInformasi'
import {
    KATEGORI_OPSI,
    kategoriInfo,
    ringkasan,
    rentangTampil,
    STATUS_LABEL,
    STATUS_TONE,
    statusTampil,
} from '../lib/informasi-helpers'
import type { Informasi, InformasiKategori } from '../types'

const SEMUA = 'semua'

const tanggalWaktuFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function InformasiPage() {
    const [kategori, setKategori] = useState<string>(SEMUA)
    const [deleting, setDeleting] = useState<Informasi | null>(null)

    const filter = kategori === SEMUA ? undefined : (kategori as InformasiKategori)
    const { data, isLoading, isError, refetch } = useInformasiList(filter)
    const deleteMutation = useDeleteInformasi()

    const items = data?.data ?? []
    const isAdmin = data?.is_admin ?? false
    const today = data?.today ?? new Date().toISOString().slice(0, 10)

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await deleteMutation.mutateAsync(deleting.id)
            toast.success('Informasi dihapus')
            setDeleting(null)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menghapus informasi'))
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                        <Megaphone className="h-6 w-6" aria-hidden />
                        Informasi Arumanis
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pengumuman, fitur baru, dan jadwal pemeliharaan sistem.
                    </p>
                </div>
                {isAdmin && (
                    <Button asChild>
                        <Link to="/informasi/tambah">
                            <Plus className="mr-2 h-4 w-4" />
                            Informasi baru
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Select value={kategori} onValueChange={setKategori}>
                    <SelectTrigger className="w-full sm:w-64" aria-label="Filter kategori">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={SEMUA}>Semua kategori</SelectItem>
                        {KATEGORI_OPSI.map((k) => (
                            <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Memuat informasi...</p>}

            {isError && (
                <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <span>Informasi belum bisa dimuat.</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>Coba lagi</Button>
                </div>
            )}

            {!isLoading && !isError && items.length === 0 && (
                <Card>
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                        Belum ada informasi{filter ? ` untuk kategori ${kategoriInfo(filter).label.toLowerCase()}` : ''}.
                    </CardContent>
                </Card>
            )}

            <ul className="space-y-4">
                {items.map((item) => {
                    const info = kategoriInfo(item.kategori)
                    const status = statusTampil(item, today)
                    const rentang = rentangTampil(item)
                    return (
                        <li key={item.id}>
                            <Card>
                                <CardHeader className="space-y-2 pb-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={info.tone}>{info.label}</Badge>
                                        {isAdmin && (
                                            <Badge variant="outline" className={STATUS_TONE[status]}>
                                                {STATUS_LABEL[status]}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-3">
                                        <CardTitle className="text-lg leading-snug">
                                            <Link to="/informasi/$id" params={{ id: String(item.id) }} className="hover:text-primary">
                                                {item.judul}
                                            </Link>
                                        </CardTitle>
                                        {isAdmin && (
                                            <div className="flex shrink-0 gap-1">
                                                <Button asChild variant="ghost" size="icon" aria-label={`Ubah ${item.judul}`}>
                                                    <Link to="/informasi/$id/edit" params={{ id: String(item.id) }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => setDeleting(item)} aria-label={`Hapus ${item.judul}`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {rentang && (
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarRange className="h-3.5 w-3.5" aria-hidden />
                                            {rentang}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{ringkasan(item.isi)}</p>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        {item.created_at && (
                                            <span>Dibuat {tanggalWaktuFormatter.format(new Date(item.created_at))}</span>
                                        )}
                                        <Link
                                            to="/informasi/$id"
                                            params={{ id: String(item.id) }}
                                            className="font-medium text-primary underline-offset-4 hover:underline"
                                        >
                                            Baca selengkapnya
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    )
                })}
            </ul>

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                entityName="informasi ini"
                description="Informasi yang dihapus tidak bisa dikembalikan."
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
