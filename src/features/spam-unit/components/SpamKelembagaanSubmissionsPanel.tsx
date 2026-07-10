import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    approveKelembagaanSubmission,
    getKelembagaanSubmissions,
    rejectKelembagaanSubmission,
} from '../api'
import type { KelembagaanFormFields, KelembagaanSubmission } from '../types/share'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const FIELD_LABELS: Record<keyof KelembagaanFormFields, string> = {
    name: 'Nama unit',
    tahun_pembangunan: 'Tahun pembangunan',
    sumber_dana: 'Sumber dana',
    program: 'Program',
    sistem_layanan: 'Sistem layanan',
    sumber_mata_air_kap: 'Kap. mata air',
    sumber_air_tanah_kap: 'Kap. air tanah',
    lain_lain_kap: 'Lain-lain',
    tarif_dasar_hukum: 'Dasar hukum tarif',
    iuran_nominal: 'Iuran',
    pendapatan_bulan: 'Pendapatan/bulan',
    biaya_operasional: 'Biaya operasional',
    pokmas: 'Nama POKMAS',
    perdes: 'Perdes',
    kepala: 'Kepala',
    bendahara: 'Bendahara',
    sekretaris: 'Sekretaris',
}

function statusBadge(status: string) {
    if (status === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
    if (status === 'approved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
}

function DiffTable({
    before,
    after,
}: {
    before?: KelembagaanFormFields | null
    after: KelembagaanFormFields
}) {
    const keys = Object.keys(after) as (keyof KelembagaanFormFields)[]
    if (keys.length === 0) {
        return <p className="text-sm text-muted-foreground">Tidak ada field di payload.</p>
    }
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-muted/50 text-left">
                        <th className="px-3 py-2 font-medium">Field</th>
                        <th className="px-3 py-2 font-medium">Sebelum</th>
                        <th className="px-3 py-2 font-medium">Usulan</th>
                    </tr>
                </thead>
                <tbody>
                    {keys.map((key) => {
                        const oldVal = before?.[key]
                        const newVal = after[key]
                        const changed = `${oldVal ?? ''}` !== `${newVal ?? ''}`
                        return (
                            <tr key={key} className={cn('border-t', changed && 'bg-amber-50/60 dark:bg-amber-950/20')}>
                                <td className="px-3 py-2 font-medium">{FIELD_LABELS[key] || key}</td>
                                <td className="px-3 py-2 text-muted-foreground">{oldVal || '—'}</td>
                                <td className="px-3 py-2 font-medium">{newVal || '—'}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export function SpamKelembagaanSubmissionsPanel() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<string>('pending')
    const [selected, setSelected] = useState<KelembagaanSubmission | null>(null)
    const [reviewNote, setReviewNote] = useState('')

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['spam-kelembagaan-submissions', status],
        queryFn: () =>
            getKelembagaanSubmissions({
                status: status === 'all' ? undefined : status,
                per_page: 30,
            }),
        staleTime: 15_000,
    })

    const approveMut = useMutation({
        mutationFn: ({ id, note }: { id: number; note?: string }) =>
            approveKelembagaanSubmission(id, note),
        onSuccess: () => {
            toast.success('Usulan disetujui — data unit diperbarui')
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-submissions'] })
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-units'] })
            queryClient.invalidateQueries({ queryKey: ['spam-units'] })
            setSelected(null)
            setReviewNote('')
        },
        onError: () => toast.error('Gagal menyetujui usulan'),
    })

    const rejectMut = useMutation({
        mutationFn: ({ id, note }: { id: number; note?: string }) =>
            rejectKelembagaanSubmission(id, note),
        onSuccess: () => {
            toast.success('Usulan ditolak')
            queryClient.invalidateQueries({ queryKey: ['spam-kelembagaan-submissions'] })
            setSelected(null)
            setReviewNote('')
        },
        onError: () => toast.error('Gagal menolak usulan'),
    })

    const items = data?.data ?? []
    const pendingCount = data?.meta?.pending_count ?? 0
    const busy = approveMut.isPending || rejectMut.isPending

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardList className="h-4 w-4" />
                                Verifikasi form kelembagaan
                                {pendingCount > 0 ? (
                                    <Badge variant="secondary" className="ml-1">
                                        {pendingCount} pending
                                    </Badge>
                                ) : null}
                            </CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Usulan dari link form publik. Setujui untuk menerapkan ke master unit SPAM.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-9 w-[160px] text-xs">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                    <SelectItem value="all">Semua</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs"
                                onClick={() => void refetch()}
                            >
                                Muat ulang
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    ) : items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Tidak ada usulan{status !== 'all' ? ` dengan status ${status}` : ''}.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {isFetching && !isLoading ? (
                                <p className="text-xs text-muted-foreground">Memperbarui...</p>
                            ) : null}
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setSelected(item)
                                        setReviewNote('')
                                    }}
                                    className="flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {item.unit?.desa || 'Desa -'} · {item.unit?.name || `Unit #${item.unit_spam_id}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.unit?.kecamatan || '-'} · dari {item.submitter_name || 'Anonim'}
                                            {item.created_at
                                                ? ` · ${new Date(item.created_at).toLocaleString('id-ID')}`
                                                : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                            statusBadge(item.status),
                                        )}
                                    >
                                        {item.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail usulan #{selected?.id}</DialogTitle>
                        <DialogDescription>
                            {selected?.unit?.kecamatan} · Desa {selected?.unit?.desa} ·{' '}
                            {selected?.unit?.name || `Unit #${selected?.unit_spam_id}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selected ? (
                        <div className="space-y-4">
                            <div className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Pengirim</p>
                                    <p className="font-medium">{selected.submitter_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Telepon</p>
                                    <p className="font-medium">{selected.submitter_phone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Instansi</p>
                                    <p className="font-medium">{selected.submitter_instansi || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <span
                                        className={cn(
                                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                            statusBadge(selected.status),
                                        )}
                                    >
                                        {selected.status}
                                    </span>
                                </div>
                                {selected.submitter_note ? (
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-muted-foreground">Catatan pengirim</p>
                                        <p>{selected.submitter_note}</p>
                                    </div>
                                ) : null}
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-semibold">Perubahan data</p>
                                <DiffTable before={selected.snapshot_before} after={selected.payload} />
                            </div>

                            {selected.status === 'pending' ? (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Catatan verifikasi (opsional)
                                    </label>
                                    <textarea
                                        value={reviewNote}
                                        onChange={(e) => setReviewNote(e.target.value)}
                                        rows={2}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        placeholder="Alasan setuju/tolak..."
                                    />
                                </div>
                            ) : selected.review_note ? (
                                <p className="text-sm text-muted-foreground">
                                    Catatan review: {selected.review_note}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                            Tutup
                        </Button>
                        {selected?.status === 'pending' ? (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={busy}
                                    onClick={() =>
                                        rejectMut.mutate({
                                            id: selected.id,
                                            note: reviewNote || undefined,
                                        })
                                    }
                                >
                                    {rejectMut.isPending ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="mr-1 h-4 w-4" />
                                    )}
                                    Tolak
                                </Button>
                                <Button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                        approveMut.mutate({
                                            id: selected.id,
                                            note: reviewNote || undefined,
                                        })
                                    }
                                >
                                    {approveMut.isPending ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                    )}
                                    Setujui & terapkan
                                </Button>
                            </>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
