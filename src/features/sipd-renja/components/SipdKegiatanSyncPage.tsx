import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckSquare, RefreshCw, Square } from 'lucide-react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { createKegiatan, getAllKegiatan, updateKegiatan } from '@/features/kegiatan/api/kegiatan'
import { kegiatanKeys } from '@/features/kegiatan/hooks/useKegiatan'
import {
    fetchSipdCachedRenja,
    SIPD_IS_ANGGARAN_PENGANGGARAN,
} from '@/features/sipd-renja/api'
import {
    buildApplyPayload,
    buildKegiatanSyncRows,
    countSyncSummary,
    isSipdHierarchyMissing,
    type KegiatanSyncFieldKey,
    type KegiatanSyncRow,
} from '@/features/sipd-renja/lib/kegiatan-sync'
import type { SipdRenjaItem } from '@/features/sipd-renja/types'
import { cn } from '@/lib/utils'

function formatCell(value: string | number | null | undefined) {
    if (value == null || value === '') return '—'
    if (typeof value === 'number') return formatCurrency(value)
    return value
}

export default function SipdKegiatanSyncPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const tahun = tahunAnggaran ? Number(tahunAnggaran) : undefined
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [rows, setRows] = useState<KegiatanSyncRow[] | null>(null)
    const [applying, setApplying] = useState(false)

    const renjaQuery = useQuery({
        queryKey: ['sipd-cached-penganggaran', tahun, SIPD_IS_ANGGARAN_PENGANGGARAN],
        queryFn: () =>
            fetchSipdCachedRenja({
                ...(tahun ? { tahun } : {}),
                is_anggaran: SIPD_IS_ANGGARAN_PENGANGGARAN,
            }),
        retry: 1,
    })

    const kegiatanQuery = useQuery({
        queryKey: [...kegiatanKeys.lists(), 'all', tahunAnggaran],
        queryFn: () => getAllKegiatan(tahunAnggaran || undefined),
        enabled: !!tahunAnggaran,
        staleTime: 60_000,
    })

    const rebuild = useMutation({
        mutationFn: async () => {
            const sipd = (renjaQuery.data?.data || []) as SipdRenjaItem[]
            const kegiatan = kegiatanQuery.data || []
            return buildKegiatanSyncRows(sipd, kegiatan)
        },
        onSuccess: (next) => {
            setRows(next)
            const s = countSyncSummary(next)
            toast.success(
                `Review siap: ${s.create} baru, ${s.update} update, ${s.unchanged} sama`,
            )
        },
        onError: (e) => {
            toast.error(e instanceof Error ? e.message : 'Gagal menyusun review')
        },
    })

    const displayRows = useMemo(() => {
        const list = rows || []
        const needle = search.trim().toLowerCase()
        if (!needle) return list
        return list.filter((r) => {
            const hay = [
                r.sipd.nama_program,
                r.sipd.nama_kegiatan,
                r.sipd.nama_sub_kegiatan,
                r.kode_sub_giat,
                String(r.id_sub_bl),
            ]
                .join(' ')
                .toLowerCase()
            return hay.includes(needle)
        })
    }, [rows, search])

    const summary = useMemo(() => countSyncSummary(rows || []), [rows])
    const hierarchyMissingCount = useMemo(
        () => (rows || []).filter((r) => isSipdHierarchyMissing(r)).length,
        [rows],
    )

    const toggleRow = (id: string, selected: boolean) => {
        setRows((prev) =>
            (prev || []).map((r) => (r.id === id ? { ...r, selected } : r)),
        )
    }

    const toggleField = (
        id: string,
        key: KegiatanSyncFieldKey,
        apply: boolean,
    ) => {
        setRows((prev) =>
            (prev || []).map((r) => {
                if (r.id !== id) return r
                return {
                    ...r,
                    fields: r.fields.map((f) =>
                        f.key === key && f.changed ? { ...f, apply } : f,
                    ),
                }
            }),
        )
    }

    const selectAllChanged = (selected: boolean) => {
        setRows((prev) =>
            (prev || []).map((r) =>
                r.action === 'unchanged' ? r : { ...r, selected },
            ),
        )
    }

    const handleApply = async () => {
        if (!rows?.length) return
        const toApply = rows.filter((r) => r.selected && r.action !== 'unchanged')
        if (toApply.length === 0) {
            toast.message('Tidak ada baris yang dipilih')
            return
        }

        setApplying(true)
        let ok = 0
        let fail = 0
        const errors: string[] = []

        try {
            for (const row of toApply) {
                try {
                    if (row.action === 'create') {
                        const payload = buildApplyPayload(row)
                        if (!payload.nama_sub_kegiatan && !payload.nama_program) {
                            throw new Error('Nama sub kegiatan kosong')
                        }
                        await createKegiatan(
                            payload as Parameters<typeof createKegiatan>[0],
                        )
                    } else if (row.action === 'update' && row.kegiatanId) {
                        const hasField = row.fields.some((f) => f.apply && f.changed)
                        const payload = buildApplyPayload(row)
                        if (!hasField && payload.sipd_id_sub_bl == null) {
                            continue
                        }
                        await updateKegiatan(row.kegiatanId, payload)
                    }
                    ok += 1
                } catch (e) {
                    fail += 1
                    errors.push(
                        `${row.sipd.nama_sub_kegiatan || row.id_sub_bl}: ${
                            e instanceof Error ? e.message : 'gagal'
                        }`,
                    )
                }
            }

            await queryClient.invalidateQueries({ queryKey: kegiatanKeys.all })
            await kegiatanQuery.refetch()
            // Rebuild preview after apply
            const sipd = (renjaQuery.data?.data || []) as SipdRenjaItem[]
            const kegiatan = await getAllKegiatan(tahunAnggaran || undefined)
            setRows(buildKegiatanSyncRows(sipd, kegiatan))

            if (fail === 0) {
                toast.success(`${ok} baris berhasil diterapkan ke Program Kegiatan`)
            } else {
                toast.error(
                    `${ok} berhasil, ${fail} gagal. ${errors.slice(0, 2).join(' · ')}`,
                )
            }
        } finally {
            setApplying(false)
        }
    }

    const loading = renjaQuery.isLoading || kegiatanQuery.isLoading
    const ready = Boolean(renjaQuery.data && kegiatanQuery.data)

    return (
        <PageContainer
            pageTitle="Review sync → Program Kegiatan"
            pageDescription="Bandingkan sub kegiatan SIPD Penganggaran dengan master Program Kegiatan. Pilih baris dan field yang diubah — tidak auto-overwrite."
            pageHeaderAction={(
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/sipd-renja">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali SIPD
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/kegiatan">Program Kegiatan</Link>
                    </Button>
                </div>
            )}
        >
            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Sumber data</CardTitle>
                        <CardDescription>
                            SIPD cache (is_anggaran=1) vs master kegiatan tahun {tahunAnggaran || '—'}.
                            Field: nama program, kegiatan, sub kegiatan, pagu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-2 text-sm">
                        {loading ? (
                            <Badge variant="outline">Memuat...</Badge>
                        ) : (
                            <>
                                <Badge variant="outline">
                                    SIPD {renjaQuery.data?.total ?? 0} sub kegiatan
                                </Badge>
                                <Badge variant="outline">
                                    Master {(kegiatanQuery.data || []).length} kegiatan
                                </Badge>
                            </>
                        )}
                        {tahun ? <Badge>TA {tahun}</Badge> : null}
                        <Button
                            size="sm"
                            onClick={() => rebuild.mutate()}
                            disabled={!ready || rebuild.isPending}
                        >
                            <RefreshCw
                                className={cn(
                                    'mr-2 h-4 w-4',
                                    rebuild.isPending && 'animate-spin',
                                )}
                            />
                            Susun review
                        </Button>
                        {rows ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => selectAllChanged(true)}
                                >
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Pilih semua berubah
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => selectAllChanged(false)}
                                >
                                    <Square className="mr-2 h-4 w-4" />
                                    Kosongkan pilihan
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => void handleApply()}
                                    disabled={applying || summary.selected === 0}
                                >
                                    {applying
                                        ? 'Menerapkan...'
                                        : `Terapkan ${summary.selected} baris`}
                                </Button>
                            </>
                        ) : null}
                    </CardContent>
                </Card>

                {rows ? (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Ringkasan review</CardTitle>
                            <CardDescription>
                                {summary.create} buat baru · {summary.update} update ·{' '}
                                {summary.unchanged} sudah sama · {summary.selected} dipilih
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {hierarchyMissingCount > 0 ? (
                                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
                                    {hierarchyMissingCount} baris SIPD tanpa{' '}
                                    <strong>nama program / kegiatan</strong> (cache lama atau service
                                    belum di-restart). Field kosong <strong>tidak</strong> menimpa
                                    master — hanya pagu/sub yang terisi yang bisa di-apply. Restart
                                    layanan sipd-lite, lalu <em>Susun review</em> ulang.
                                </div>
                            ) : null}
                            <Input
                                placeholder="Cari program / kegiatan / kode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-md"
                            />
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">✓</TableHead>
                                            <TableHead className="w-[140px]">Status</TableHead>
                                            <TableHead className="min-w-[220px]">SIPD (usulan)</TableHead>
                                            <TableHead className="min-w-[220px]">Arumanis (saat ini)</TableHead>
                                            <TableHead className="min-w-[260px]">Field diubah</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    Tidak ada baris.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayRows.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell className="align-top">
                                                        {row.action === 'unchanged' ? (
                                                            <span className="text-muted-foreground">—</span>
                                                        ) : (
                                                            <Checkbox
                                                                checked={row.selected}
                                                                onCheckedChange={(v) =>
                                                                    toggleRow(row.id, v === true)
                                                                }
                                                                aria-label="Pilih baris"
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top space-y-1">
                                                        {row.action === 'create' ? (
                                                            <Badge>Baru</Badge>
                                                        ) : row.action === 'update' ? (
                                                            <Badge variant="secondary">Update</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Sama</Badge>
                                                        )}
                                                        <div className="font-mono text-[11px] text-muted-foreground break-all">
                                                            {row.kode_sub_giat || '—'}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            id_sub_bl {row.id_sub_bl}
                                                            {row.kegiatanId
                                                                ? ` · #${row.kegiatanId}`
                                                                : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-sm space-y-1.5">
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                                Sub kegiatan
                                                            </div>
                                                            <div className="font-medium leading-snug">
                                                                {row.sipd.nama_sub_kegiatan || '—'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                                Kegiatan
                                                            </div>
                                                            <div className="text-xs leading-snug">
                                                                {row.sipd.nama_kegiatan || (
                                                                    <span className="text-muted-foreground italic">
                                                                        (tidak di cache)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                                Program
                                                            </div>
                                                            <div className="text-xs leading-snug">
                                                                {row.sipd.nama_program || (
                                                                    <span className="text-muted-foreground italic">
                                                                        (tidak di cache)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium tabular-nums">
                                                            {formatCurrency(row.sipd.pagu)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top text-sm space-y-1.5">
                                                        {row.action === 'create' ? (
                                                            <span className="text-muted-foreground text-xs">
                                                                Belum ada di master
                                                            </span>
                                                        ) : (
                                                            row.fields.map((f) => (
                                                                <div key={f.key} className="text-xs leading-snug">
                                                                    <span className="text-muted-foreground">
                                                                        {f.label}:{' '}
                                                                    </span>
                                                                    <span
                                                                        className={cn(
                                                                            f.changed &&
                                                                                'text-amber-700 dark:text-amber-400',
                                                                        )}
                                                                    >
                                                                        {formatCell(f.current)}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        {row.action === 'unchanged' ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                Tidak ada perbedaan
                                                            </span>
                                                        ) : row.action === 'create' ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                Semua field SIPD (sumber dana default APBD)
                                                            </span>
                                                        ) : row.fields.some((f) => f.changed) ? (
                                                            <div className="space-y-1.5">
                                                                {row.fields
                                                                    .filter((f) => f.changed)
                                                                    .map((f) => (
                                                                        <label
                                                                            key={f.key}
                                                                            className="flex items-start gap-2 text-xs cursor-pointer"
                                                                        >
                                                                            <Checkbox
                                                                                checked={f.apply}
                                                                                onCheckedChange={(v) =>
                                                                                    toggleField(
                                                                                        row.id,
                                                                                        f.key,
                                                                                        v === true,
                                                                                    )
                                                                                }
                                                                                disabled={!row.selected}
                                                                            />
                                                                            <span className="min-w-0">
                                                                                <span className="font-medium">
                                                                                    {f.label}
                                                                                </span>
                                                                                <br />
                                                                                <span className="text-muted-foreground line-through break-words">
                                                                                    {formatCell(f.current)}
                                                                                </span>
                                                                                <br />
                                                                                <span className="break-words">
                                                                                    → {formatCell(f.sipd)}
                                                                                </span>
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                Tidak ada field SIPD yang bisa menimpa
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            Klik <strong>Susun review</strong> untuk membandingkan cache SIPD dengan
                            master Program Kegiatan. Tidak ada data yang diubah sampai Anda menekan
                            Terapkan.
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageContainer>
    )
}
