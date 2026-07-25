import { useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    FileSpreadsheet,
    Loader2,
    Upload,
    Download,
    RefreshCw,
    Link2,
    AlertTriangle,
    CheckCircle2,
    CircleDashed,
    Ban,
    Banknote,
    ChevronLeft,
    ChevronRight,
    Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { cn } from '@/lib/utils'
import {
    applyPencairanPlans,
    buildPencairanPlans,
    type PencairanApplyPlan,
} from '../lib/apply-pencairan'
import {
    loadSp2dKegiatanCatalog,
    loadSp2dPekerjaanCatalog,
    loadSp2dPenyediaCatalog,
} from '../lib/catalog'
import { exportSp2dMatchExcel } from '../lib/export-sp2d-match'
import {
    filterRowsBySubKegiatanMulti,
    sp2dRowIdentity,
} from '../lib/filter-sub-kegiatan'
import {
    aggregateByPekerjaan,
    applyManualPekerjaan,
    applyManualPenyedia,
    matchSp2dRowsChunked,
    summarizeByKategori,
    summarizeMatches,
} from '../lib/match-sp2d'
import {
    SP2D_KATEGORI_LABEL,
    SP2D_KATEGORI_SHORT,
    type Sp2dPembayaranKategori,
} from '../lib/normalize'
import { parseSp2dFile } from '../lib/parse-sp2d-excel'
import type {
    Sp2dMatchRef,
    Sp2dMatchedRow,
    Sp2dMatchStatus,
    Sp2dParseMeta,
    Sp2dRow,
    Sp2dSubKegiatanFilterResult,
} from '../types'
import { MatchOverrideDialog } from './MatchOverrideDialog'

const DETAIL_PAGE_SIZE = 25
const REKAP_PAGE_SIZE = 20

function rowKey(row: Pick<Sp2dRow, 'fileName' | 'index' | 'nomorSp2d'>) {
    return sp2dRowIdentity(row)
}

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value || 0)
}

function kategoriBadge(kategori: Sp2dPembayaranKategori) {
    switch (kategori) {
        case 'silpa_pemeliharaan':
            return (
                <Badge
                    variant="outline"
                    className="whitespace-nowrap border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
                    title={SP2D_KATEGORI_LABEL.silpa_pemeliharaan}
                >
                    SILPA 5%
                </Badge>
            )
        case 'uang_muka':
            return (
                <Badge
                    className="whitespace-nowrap bg-sky-600 hover:bg-sky-600"
                    title={SP2D_KATEGORI_LABEL.uang_muka}
                >
                    UM 30%
                </Badge>
            )
        case 'termin':
            return (
                <Badge
                    className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-600"
                    title={SP2D_KATEGORI_LABEL.termin}
                >
                    Termin
                </Badge>
            )
        default:
            return (
                <Badge variant="secondary" className="whitespace-nowrap">
                    Lainnya
                </Badge>
            )
    }
}

function statusBadge(status: Sp2dMatchStatus) {
    switch (status) {
        case 'matched':
            return (
                <Badge className="gap-1 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Match
                </Badge>
            )
        case 'partial':
            return (
                <Badge className="gap-1 whitespace-nowrap bg-amber-500 hover:bg-amber-600">
                    <CircleDashed className="h-3 w-3" /> Sebagian
                </Badge>
            )
        case 'skipped':
            return (
                <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                    <Ban className="h-3 w-3" /> Non-paket
                </Badge>
            )
        default:
            return (
                <Badge variant="destructive" className="gap-1 whitespace-nowrap">
                    <AlertTriangle className="h-3 w-3" /> Belum
                </Badge>
            )
    }
}

/** Compact override control — truncates long names, full text in title tooltip. */
function MatchOverrideCell({
    label,
    score,
    emptyLabel,
    disabled,
    onClick,
}: {
    label: string | null | undefined
    score?: number | null
    emptyLabel: string
    disabled?: boolean
    onClick: () => void
}) {
    if (disabled) {
        return <span className="text-xs text-muted-foreground">—</span>
    }

    const hasValue = Boolean(label?.trim())
    return (
        <button
            type="button"
            title={hasValue ? label! : emptyLabel}
            onClick={onClick}
            className={cn(
                'group flex w-full max-w-[14rem] items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors',
                'hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                hasValue ? 'bg-background' : 'border-dashed bg-muted/20',
            )}
        >
            <span
                className={cn(
                    'min-w-0 flex-1 truncate text-xs leading-tight',
                    hasValue ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
            >
                {hasValue ? label : emptyLabel}
            </span>
            {hasValue && score != null && score > 0 && score < 1 ? (
                <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {Math.round(score * 100)}%
                </span>
            ) : null}
            <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100" />
        </button>
    )
}

type StatusFilter = 'all' | Sp2dMatchStatus
type KategoriFilter = 'all' | Sp2dPembayaranKategori

type OverrideTarget = {
    key: string
    kind: 'penyedia' | 'pekerjaan'
}

export default function Sp2dRealisasiPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const tahun = Number(tahunAnggaran) || new Date().getFullYear()
    const queryClient = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)

    const [rawRows, setRawRows] = useState<Sp2dRow[]>([])
    const [metas, setMetas] = useState<Sp2dParseMeta[]>([])
    const [matched, setMatched] = useState<Sp2dMatchedRow[]>([])
    const [filterInfo, setFilterInfo] = useState<Sp2dSubKegiatanFilterResult | null>(null)
    const [parsing, setParsing] = useState(false)
    const [matching, setMatching] = useState(false)
    const [matchProgress, setMatchProgress] = useState({ done: 0, total: 0 })
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [kategoriFilter, setKategoriFilter] = useState<KategoriFilter>('all')
    const [rekapKategoriFilter, setRekapKategoriFilter] = useState<KategoriFilter>('all')
    const [search, setSearch] = useState('')
    const [rekapSearch, setRekapSearch] = useState('')
    const [detailPage, setDetailPage] = useState(1)
    const [rekapPage, setRekapPage] = useState(1)
    /** Composite keys `pekerjaanId::kategori` from rekap */
    const [selectedRekapKeys, setSelectedRekapKeys] = useState<string[]>([])
    const [pencairanOpen, setPencairanOpen] = useState(false)
    const [pencairanPlans, setPencairanPlans] = useState<PencairanApplyPlan[]>([])
    const [applyingPencairan, setApplyingPencairan] = useState(false)
    const [applyProgress, setApplyProgress] = useState({ done: 0, total: 0 })
    const [overrideTarget, setOverrideTarget] = useState<OverrideTarget | null>(null)

    const penyediaQuery = useQuery({
        queryKey: ['sp2d-catalog-penyedia'],
        queryFn: loadSp2dPenyediaCatalog,
        staleTime: 5 * 60_000,
    })

    const kegiatanQuery = useQuery({
        queryKey: ['sp2d-catalog-kegiatan', tahunAnggaran],
        queryFn: () => loadSp2dKegiatanCatalog(String(tahunAnggaran)),
        staleTime: 5 * 60_000,
    })

    const pekerjaanQuery = useQuery({
        queryKey: ['sp2d-catalog-pekerjaan', tahunAnggaran],
        queryFn: () => loadSp2dPekerjaanCatalog(String(tahunAnggaran)),
        staleTime: 5 * 60_000,
    })

    const penyediaOptions = useMemo(
        () => (penyediaQuery.data ?? []).map((p) => ({ id: p.id, label: p.nama })),
        [penyediaQuery.data],
    )
    const pekerjaanOptions = useMemo(
        () => (pekerjaanQuery.data ?? []).map((p) => ({ id: p.id, label: p.nama_paket })),
        [pekerjaanQuery.data],
    )

    const summary = useMemo(() => summarizeMatches(matched), [matched])
    const byKategori = useMemo(() => summarizeByKategori(matched), [matched])
    const byPaket = useMemo(() => aggregateByPekerjaan(matched), [matched])
    const applyableRekapKeys = useMemo(
        () => byPaket.filter((p) => p.canApply).map((p) => p.key),
        [byPaket],
    )

    const filteredRekap = useMemo(() => {
        const q = rekapSearch.trim().toLowerCase()
        return byPaket.filter((p) => {
            if (rekapKategoriFilter !== 'all' && p.kategori !== rekapKategoriFilter) return false
            if (!q) return true
            return (
                p.namaPaket.toLowerCase().includes(q) ||
                (p.penyediaLabel ?? '').toLowerCase().includes(q) ||
                (p.subKegiatanLabel ?? '').toLowerCase().includes(q) ||
                p.kategoriLabel.toLowerCase().includes(q)
            )
        })
    }, [byPaket, rekapSearch, rekapKategoriFilter])

    const rekapPageCount = Math.max(1, Math.ceil(filteredRekap.length / REKAP_PAGE_SIZE))
    const safeRekapPage = Math.min(rekapPage, rekapPageCount)
    const pagedRekap = useMemo(() => {
        const start = (safeRekapPage - 1) * REKAP_PAGE_SIZE
        return filteredRekap.slice(start, start + REKAP_PAGE_SIZE)
    }, [filteredRekap, safeRekapPage])

    const rekapTotals = useMemo(() => {
        const selected = byPaket.filter((p) => selectedRekapKeys.includes(p.key))
        return {
            paket: byPaket.length,
            applyable: applyableRekapKeys.length,
            selected: selected.length,
            selectedBruto: selected.reduce((s, p) => s + p.totalBruto, 0),
            totalBruto: byPaket.reduce((s, p) => s + p.totalBruto, 0),
            silpaBruto: byKategori.silpa_pemeliharaan.bruto,
            umBruto: byKategori.uang_muka.bruto,
            terminBruto: byKategori.termin.bruto,
        }
    }, [byPaket, selectedRekapKeys, applyableRekapKeys, byKategori])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return matched.filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false
            if (kategoriFilter !== 'all' && row.kategori !== kategoriFilter) return false
            if (!q) return true
            return (
                row.namaPenerima.toLowerCase().includes(q) ||
                row.keterangan.toLowerCase().includes(q) ||
                row.nomorSp2d.toLowerCase().includes(q) ||
                row.paketHint.toLowerCase().includes(q) ||
                (row.matchedPekerjaan?.label ?? '').toLowerCase().includes(q) ||
                (row.matchedPenyedia?.label ?? '').toLowerCase().includes(q)
            )
        })
    }, [matched, statusFilter, kategoriFilter, search])

    const detailPageCount = Math.max(1, Math.ceil(filtered.length / DETAIL_PAGE_SIZE))
    const safeDetailPage = Math.min(detailPage, detailPageCount)
    const pagedRows = useMemo(() => {
        const start = (safeDetailPage - 1) * DETAIL_PAGE_SIZE
        return filtered.slice(start, start + DETAIL_PAGE_SIZE)
    }, [filtered, safeDetailPage])

    const overrideRow = useMemo(() => {
        if (!overrideTarget) return null
        return matched.find((r) => rowKey(r) === overrideTarget.key) ?? null
    }, [matched, overrideTarget])

    const handleFiles = async (files: FileList | null) => {
        if (!files?.length) return
        setParsing(true)
        try {
            const nextRows: Sp2dRow[] = []
            const nextMetas: Sp2dParseMeta[] = []
            for (const file of Array.from(files)) {
                if (!/\.(xlsx|xls)$/i.test(file.name)) {
                    toast.error(`${file.name}: hanya file Excel (.xlsx/.xls)`)
                    continue
                }
                const parsed = await parseSp2dFile(file)
                nextRows.push(...parsed.rows)
                nextMetas.push(parsed.meta)
            }
            if (!nextRows.length) {
                toast.error('Tidak ada baris SP2D yang terbaca')
                return
            }
            setRawRows(nextRows)
            setMetas(nextMetas)
            setMatched([])
            setFilterInfo(null)
            setSelectedRekapKeys([])
            setDetailPage(1)
            setRekapPage(1)
            setRekapSearch('')
            setKategoriFilter('all')
            setRekapKategoriFilter('all')
            toast.success(`${nextRows.length} baris dari ${nextMetas.length} file siap difilter`)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Gagal membaca file Excel')
        } finally {
            setParsing(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    const runMatch = async () => {
        if (!rawRows.length) {
            toast.error('Upload file SP2D terlebih dahulu')
            return
        }
        setMatching(true)
        setMatchProgress({ done: 0, total: 0 })
        try {
            const [penyedia, pekerjaan, kegiatan] = await Promise.all([
                penyediaQuery.refetch().then((r) => r.data ?? loadSp2dPenyediaCatalog()),
                pekerjaanQuery.refetch().then((r) => r.data ?? loadSp2dPekerjaanCatalog(String(tahunAnggaran))),
                kegiatanQuery.refetch().then((r) => r.data ?? loadSp2dKegiatanCatalog(String(tahunAnggaran))),
            ])
            if (!kegiatan.length) {
                toast.error(`Master sub kegiatan TA ${tahunAnggaran} kosong`)
                return
            }
            if (!penyedia.length) {
                toast.error('Katalog penyedia kosong')
                return
            }
            if (!pekerjaan.length) {
                toast.error(`Katalog pekerjaan TA ${tahunAnggaran} kosong`)
                return
            }

            // 1) Filter: only rows whose "Sub Keg." matches master kegiatan
            const filtered = filterRowsBySubKegiatanMulti(rawRows, kegiatan)
            setFilterInfo({
                kept: filtered.kept,
                droppedCount: filtered.droppedCount,
                unmatchedSubKegCount: filtered.unmatchedSubKegCount,
                noSubKegCount: filtered.noSubKegCount,
                matchedSubKegiatanLabels: filtered.matchedSubKegiatanLabels,
            })

            if (!filtered.kept.length) {
                setMatched([])
                toast.error(
                    'Tidak ada baris SP2D yang Sub Keg.-nya cocok master kegiatan. Cek TA / nama sub kegiatan.',
                )
                return
            }

            // 2) Match penyedia + paket only on kept rows (scoped by sub kegiatan)
            setMatchProgress({ done: 0, total: filtered.kept.length })
            const result = await matchSp2dRowsChunked(filtered.kept, penyedia, pekerjaan, {
                chunkSize: 40,
                subKegiatanByKey: filtered.subKegiatanByKey,
                rowKeyOf: rowKey,
                onProgress: (done, total) => setMatchProgress({ done, total }),
            })
            setMatched(result)
            setDetailPage(1)
            setRekapPage(1)
            const agg = aggregateByPekerjaan(result)
            // Default pilih UM + Termin saja (bukan SILPA)
            setSelectedRekapKeys(agg.filter((p) => p.canApply).map((p) => p.key))
            const s = summarizeMatches(result)
            const kat = summarizeByKategori(result)
            toast.success(
                `Sub Keg. ${filtered.kept.length}/${rawRows.length} · Match ${s.matched} · UM ${kat.uang_muka.count} · Termin ${kat.termin.count} · SILPA ${kat.silpa_pemeliharaan.count}`,
            )
        } catch (error) {
            console.error(error)
            toast.error('Gagal mencocokkan data')
        } finally {
            setMatching(false)
            setMatchProgress({ done: 0, total: 0 })
        }
    }

    const openPencairanDialog = (keys?: string[]) => {
        const targetKeys = keys?.length ? keys : selectedRekapKeys
        if (!targetKeys.length) {
            toast.error('Pilih minimal satu baris rekap (Uang Muka / Termin) yang punya nilai kontrak')
            return
        }
        // SILPA tidak ikut progress TA berjalan
        const plans = buildPencairanPlans(matched, { onlyKeys: targetKeys })
        if (!plans.length) {
            toast.error(
                'Tidak ada paket siap diterapkan. Rekap hanya 30% / 65% / 95% / 100%.',
            )
            return
        }
        setPencairanPlans(plans)
        setPencairanOpen(true)
    }

    const confirmApplyPencairan = async () => {
        const applicable = pencairanPlans.filter((p) => !p.reason && p.entries.length > 0)
        if (!applicable.length) {
            toast.error('Tidak ada paket yang bisa diterapkan (cek nilai kontrak / tanggal)')
            return
        }

        setApplyingPencairan(true)
        setApplyProgress({ done: 0, total: applicable.length })
        try {
            const results = await applyPencairanPlans(pencairanPlans, tahun, (done, total) => {
                setApplyProgress({ done, total })
            })
            const ok = results.filter((r) => r.ok).length
            const fail = results.filter((r) => !r.ok).length
            if (ok > 0) {
                toast.success(`${ok} paket: realisasi keuangan ditimpa dari SP2D`)
                await queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi'] })
            }
            if (fail > 0) {
                toast.warning(`${fail} paket dilewati / gagal — cek detail di dialog`)
            }
            if (ok > 0 && fail === 0) {
                setPencairanOpen(false)
            }
        } catch (error) {
            console.error(error)
            toast.error('Gagal menerapkan ke progress pencairan')
        } finally {
            setApplyingPencairan(false)
        }
    }

    const toggleRekapSelect = (key: string, checked: boolean) => {
        setSelectedRekapKeys((current) => {
            if (checked) return current.includes(key) ? current : [...current, key]
            return current.filter((x) => x !== key)
        })
    }

    const toggleAllApplyable = (checked: boolean) => {
        setSelectedRekapKeys(checked ? applyableRekapKeys : [])
    }

    const updateMatchedRow = (key: string, updater: (row: Sp2dMatchedRow) => Sp2dMatchedRow) => {
        setMatched((prev) => prev.map((row) => (rowKey(row) === key ? updater(row) : row)))
    }

    const handleOverrideSelect = (value: Sp2dMatchRef | null) => {
        if (!overrideTarget) return
        const key = overrideTarget.key
        const pekerjaanCatalog = pekerjaanQuery.data ?? []
        if (overrideTarget.kind === 'penyedia') {
            updateMatchedRow(key, (row) => applyManualPenyedia(row, value, pekerjaanCatalog))
        } else {
            updateMatchedRow(key, (row) => applyManualPekerjaan(row, value, pekerjaanCatalog))
        }
    }

    const catalogLoading =
        penyediaQuery.isLoading || pekerjaanQuery.isLoading || kegiatanQuery.isLoading

    return (
        <>
            <Header fixed />
            <Main className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-background to-background p-6 shadow-sm">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
                    <div className="relative space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/5 text-emerald-700">
                                <FileSpreadsheet className="h-3 w-3" />
                                Realisasi SP2D
                            </Badge>
                            <Badge variant="secondary" className="font-mono text-[11px]">
                                TA {tahunAnggaran}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Import Register SP2D
                        </h1>
                        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                            Upload Register SP2D. Hanya baris yang <strong>Sub Keg.</strong> di Keterangan cocok
                            master sub kegiatan (TA aktif) yang dianalisis. Lalu cocokkan penyedia + nama paket.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Sub kegiatan (master)</CardDescription>
                            <CardTitle className="text-2xl">
                                {kegiatanQuery.isLoading ? '…' : (kegiatanQuery.data?.length ?? 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Paket TA {tahunAnggaran}</CardDescription>
                            <CardTitle className="text-2xl">
                                {pekerjaanQuery.isLoading ? '…' : (pekerjaanQuery.data?.length ?? 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Baris file</CardDescription>
                            <CardTitle className="text-2xl">{rawRows.length || '—'}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Lolos filter Sub Keg.</CardDescription>
                            <CardTitle className="text-2xl text-sky-600">
                                {filterInfo ? filterInfo.kept.length : matched.length || '—'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Match penuh</CardDescription>
                            <CardTitle className="text-2xl text-emerald-600">
                                {matched.length ? summary.matched : '—'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">1. Upload file Excel</CardTitle>
                        <CardDescription>
                            Format: Register SP2D (Transaksi) — sheet Data Realisasi. Bisa multi-file (Juni + Juli).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={cn(
                                'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                                parsing ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/40 hover:bg-muted/40',
                            )}
                        >
                            {parsing ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Pilih atau seret file .xlsx</p>
                                <p className="text-xs text-muted-foreground">
                                    Contoh: &quot;Juni Laporan Register SP2D.xlsx&quot;
                                </p>
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                multiple
                                className="hidden"
                                onChange={(e) => void handleFiles(e.target.files)}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={parsing}
                                onClick={() => fileRef.current?.click()}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Pilih file
                            </Button>
                        </div>

                        {metas.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {metas.map((m) => (
                                    <Badge key={m.fileName} variant="outline" className="font-normal">
                                        {m.fileName}
                                        {m.periodeLabel ? ` · ${m.periodeLabel}` : ''} · {m.rowCount} baris
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => void runMatch()}
                                disabled={!rawRows.length || matching || catalogLoading}
                            >
                                {matching ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Link2 className="mr-2 h-4 w-4" />
                                )}
                                {matching && matchProgress.total > 0
                                    ? `Mencocokkan… ${matchProgress.done}/${matchProgress.total}`
                                    : 'Filter Sub Keg. + cocokkan'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!matched.length}
                                onClick={() => {
                                    exportSp2dMatchExcel(matched)
                                    toast.success('Excel hasil match diunduh')
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export hasil
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={!matched.length || selectedRekapKeys.length === 0}
                                onClick={() => openPencairanDialog()}
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                Terapkan ke Progress Pencairan
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Muat ulang katalog"
                                onClick={() => {
                                    void penyediaQuery.refetch()
                                    void pekerjaanQuery.refetch()
                                }}
                            >
                                <RefreshCw className={cn('h-4 w-4', catalogLoading && 'animate-spin')} />
                            </Button>
                        </div>
                        {filterInfo && (
                            <div className="rounded-lg border bg-sky-50/80 p-3 text-sm text-sky-950 dark:bg-sky-950/30 dark:text-sky-100">
                                <p className="font-medium">
                                    Filter Sub Keg.: {filterInfo.kept.length} baris dianalisis ·{' '}
                                    {filterInfo.droppedCount} dibuang
                                </p>
                                <p className="mt-1 text-xs opacity-90">
                                    Tanpa Sub Keg.: {filterInfo.noSubKegCount} · Sub Keg. tidak cocok master:{' '}
                                    {filterInfo.unmatchedSubKegCount}
                                    {filterInfo.matchedSubKegiatanLabels.length
                                        ? ` · Master hit: ${filterInfo.matchedSubKegiatanLabels.slice(0, 4).join('; ')}${
                                              filterInfo.matchedSubKegiatanLabels.length > 4
                                                  ? ` (+${filterInfo.matchedSubKegiatanLabels.length - 4})`
                                                  : ''
                                          }`
                                        : ''}
                                </p>
                            </div>
                        )}
                        {matched.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                                Progress pencairan = tab Progress → <strong>Progress Keuangan</strong> → Realisasi.
                                % = kumulatif bruto ÷ nilai kontrak. Hanya baris lolos Sub Keg.
                                {selectedRekapKeys.length > 0
                                    ? ` · ${selectedRekapKeys.length} baris rekap dipilih (UM/Termin).`
                                    : ''}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {matched.length > 0 && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <SummaryChip label="Total bruto" value={formatRupiah(summary.totalBruto)} />
                            <SummaryChip
                                label="Uang Muka 30%"
                                value={`${byKategori.uang_muka.count} · ${formatRupiah(byKategori.uang_muka.bruto)}`}
                                tone="success"
                            />
                            <SummaryChip
                                label="Termin (65/95/100%)"
                                value={`${byKategori.termin.count} · ${formatRupiah(byKategori.termin.bruto)}`}
                                tone="success"
                            />
                            <SummaryChip
                                label="SILPA 5% (TA sblm)"
                                value={`${byKategori.silpa_pemeliharaan.count} · ${formatRupiah(byKategori.silpa_pemeliharaan.bruto)}`}
                                tone="warn"
                            />
                            <SummaryChip label="Match penuh" value={String(summary.matched)} />
                            <SummaryChip label="Sebagian / belum" value={String(summary.partial + summary.unmatched)} tone="danger" />
                        </div>

                        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground sm:text-sm">
                            <p>
                                <strong className="text-foreground">Rekap ter-match</strong> hanya{' '}
                                <strong className="text-foreground">30% · 65% · 95% · 100%</strong> → apply ke
                                Progress Keuangan.
                            </p>
                            <p className="mt-1">
                                <strong className="text-foreground">SILPA 5%</strong> tidak masuk rekap/apply
                                (retensi TA sebelumnya).
                            </p>
                        </div>

                        {byPaket.length > 0 && (
                            <Card>
                                <CardHeader className="gap-3 space-y-0">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="text-base">
                                                Rekap realisasi per paket (ter-match)
                                            </CardTitle>
                                            <CardDescription>
                                                Hanya <strong>30% (UM)</strong>, <strong>65%</strong>,{' '}
                                                <strong>95%</strong>, dan <strong>100%</strong>. SILPA 5% tidak
                                                ditampilkan di sini.
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                                            disabled={selectedRekapKeys.length === 0}
                                            onClick={() => openPencairanDialog()}
                                        >
                                            <Banknote className="mr-2 h-4 w-4" />
                                            Terapkan terpilih ({selectedRekapKeys.length})
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <Input
                                            placeholder="Cari paket / penyedia / sub keg…"
                                            value={rekapSearch}
                                            onChange={(e) => {
                                                setRekapSearch(e.target.value)
                                                setRekapPage(1)
                                            }}
                                            className="h-9 w-full sm:w-[220px]"
                                        />
                                        <Select
                                            value={rekapKategoriFilter}
                                            onValueChange={(v) => {
                                                setRekapKategoriFilter(v as KategoriFilter)
                                                setRekapPage(1)
                                            }}
                                        >
                                            <SelectTrigger className="h-9 w-[160px]">
                                                <SelectValue placeholder="Kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">30 · 65 · 95 · 100%</SelectItem>
                                                <SelectItem value="uang_muka">UM 30%</SelectItem>
                                                <SelectItem value="termin">Termin 65/95/100%</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="font-normal">
                                                {filteredRekap.length} baris
                                            </Badge>
                                            <Badge variant="secondary" className="font-normal">
                                                {rekapTotals.applyable} siap apply
                                            </Badge>
                                            {rekapTotals.selected > 0 ? (
                                                <Badge className="bg-emerald-600 font-normal tabular-nums hover:bg-emerald-600">
                                                    Terpilih {rekapTotals.selected} ·{' '}
                                                    {formatRupiah(rekapTotals.selectedBruto)}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 overflow-x-auto">
                                    <Table className="min-w-[980px] table-fixed">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">
                                                    <Checkbox
                                                        checked={
                                                            applyableRekapKeys.length > 0 &&
                                                            applyableRekapKeys.every((k) =>
                                                                selectedRekapKeys.includes(k),
                                                            )
                                                                ? true
                                                                : selectedRekapKeys.some((k) =>
                                                                        applyableRekapKeys.includes(k),
                                                                    )
                                                                  ? 'indeterminate'
                                                                  : false
                                                        }
                                                        onCheckedChange={(v) => toggleAllApplyable(v === true)}
                                                        aria-label="Pilih semua UM/Termin siap pencairan"
                                                    />
                                                </TableHead>
                                                <TableHead className="w-[7rem]">Kategori</TableHead>
                                                <TableHead className="w-[20rem]">Paket</TableHead>
                                                <TableHead className="w-[11rem]">Penyedia</TableHead>
                                                <TableHead className="w-[3.5rem] text-right">#</TableHead>
                                                <TableHead className="w-[7.5rem] text-right">Bruto</TableHead>
                                                <TableHead className="w-[7.5rem] text-right">Kontrak</TableHead>
                                                <TableHead className="w-[4.5rem] text-right">%</TableHead>
                                                <TableHead className="w-[5.5rem] text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pagedRekap.map((item) => {
                                                const canApply = item.canApply
                                                const isPartial =
                                                    item.fullMatchCount < item.count || !item.penyediaLabel
                                                return (
                                                    <TableRow key={item.key} className="align-top">
                                                        <TableCell className="py-2.5">
                                                            <Checkbox
                                                                checked={selectedRekapKeys.includes(item.key)}
                                                                disabled={!canApply}
                                                                onCheckedChange={(v) =>
                                                                    toggleRekapSelect(item.key, v === true)
                                                                }
                                                                aria-label={`Pilih ${item.namaPaket} ${item.kategoriLabel}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-2.5">
                                                            {item.kategori === 'uang_muka' ? (
                                                                kategoriBadge('uang_muka')
                                                            ) : (
                                                                <Badge
                                                                    className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-600"
                                                                    title={item.kategoriLabel}
                                                                >
                                                                    {item.kategoriLabel}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2.5">
                                                            <a
                                                                href={`/pekerjaan/${item.pekerjaanId}`}
                                                                className="block truncate text-sm font-medium text-primary hover:underline"
                                                                title={item.namaPaket}
                                                            >
                                                                {item.namaPaket}
                                                            </a>
                                                            {item.subKegiatanLabel ? (
                                                                <div
                                                                    className="mt-0.5 truncate text-[11px] text-sky-700 dark:text-sky-300"
                                                                    title={item.subKegiatanLabel}
                                                                >
                                                                    {item.subKegiatanLabel}
                                                                </div>
                                                            ) : null}
                                                            {isPartial ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="mt-1 h-5 border-amber-300 px-1.5 text-[10px] font-normal text-amber-700"
                                                                >
                                                                    Sebagian match
                                                                </Badge>
                                                            ) : null}
                                                            {item.kategori === 'silpa_pemeliharaan' ? (
                                                                <p className="mt-1 text-[10px] text-violet-700 dark:text-violet-300">
                                                                    Retensi TA sblm · tidak auto-apply
                                                                </p>
                                                            ) : null}
                                                        </TableCell>
                                                        <TableCell className="py-2.5">
                                                            <div
                                                                className="truncate text-sm text-muted-foreground"
                                                                title={item.penyediaLabel || undefined}
                                                            >
                                                                {item.penyediaLabel || '—'}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                                                            {item.count}
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                                                            {formatRupiah(item.totalBruto)}
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                                                            {item.nilaiKontrak != null
                                                                ? formatRupiah(item.nilaiKontrak)
                                                                : (
                                                                    <span
                                                                        className="text-xs text-muted-foreground"
                                                                        title="Tanpa nilai kontrak"
                                                                    >
                                                                        —
                                                                    </span>
                                                                )}
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                                                            {item.sp2dPercentOfKontrak != null ? (
                                                                <span
                                                                    className={cn(
                                                                        item.sp2dPercentOfKontrak > 100 &&
                                                                            'font-medium text-amber-600',
                                                                    )}
                                                                >
                                                                    {item.sp2dPercentOfKontrak}%
                                                                </span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                disabled={!canApply}
                                                                title={
                                                                    canApply
                                                                        ? 'Terapkan ke Progress Keuangan'
                                                                        : item.kategori === 'silpa_pemeliharaan'
                                                                          ? 'SILPA retensi TA sebelumnya'
                                                                          : 'Butuh nilai kontrak'
                                                                }
                                                                onClick={() => openPencairanDialog([item.key])}
                                                            >
                                                                {item.kategori === 'uang_muka'
                                                                    ? 'UM'
                                                                    : item.kategori === 'silpa_pemeliharaan'
                                                                      ? '—'
                                                                      : 'Pencairan'}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {pagedRekap.length === 0 && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={9}
                                                        className="py-10 text-center text-muted-foreground"
                                                    >
                                                        Tidak ada paket untuk filter ini.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    {filteredRekap.length > REKAP_PAGE_SIZE && (
                                        <div className="flex items-center justify-between gap-2 text-sm">
                                            <span className="text-muted-foreground">
                                                {(safeRekapPage - 1) * REKAP_PAGE_SIZE + 1}–
                                                {Math.min(
                                                    safeRekapPage * REKAP_PAGE_SIZE,
                                                    filteredRekap.length,
                                                )}{' '}
                                                dari {filteredRekap.length} paket
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={safeRekapPage <= 1}
                                                    onClick={() => setRekapPage((p) => Math.max(1, p - 1))}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="tabular-nums">
                                                    {safeRekapPage}/{rekapPageCount}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={safeRekapPage >= rekapPageCount}
                                                    onClick={() =>
                                                        setRekapPage((p) => Math.min(rekapPageCount, p + 1))
                                                    }
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <CardTitle className="text-base">Detail pencocokan</CardTitle>
                                    <CardDescription>
                                        Sesuaikan match manual jika skor otomatis kurang tepat.
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Input
                                        placeholder="Cari penerima / paket / no SP2D…"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value)
                                            setDetailPage(1)
                                        }}
                                        className="w-[220px]"
                                    />
                                    <Select
                                        value={kategoriFilter}
                                        onValueChange={(v) => {
                                            setKategoriFilter(v as KategoriFilter)
                                            setDetailPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua kategori</SelectItem>
                                            <SelectItem value="uang_muka">UM 30%</SelectItem>
                                            <SelectItem value="termin">Termin</SelectItem>
                                            <SelectItem value="silpa_pemeliharaan">SILPA 5%</SelectItem>
                                            <SelectItem value="lainnya">Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(v) => {
                                            setStatusFilter(v as StatusFilter)
                                            setDetailPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua status</SelectItem>
                                            <SelectItem value="matched">Match</SelectItem>
                                            <SelectItem value="partial">Sebagian</SelectItem>
                                            <SelectItem value="unmatched">Belum</SelectItem>
                                            <SelectItem value="skipped">Non-paket</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table className="min-w-[1040px] table-fixed">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">#</TableHead>
                                            <TableHead className="w-[6.5rem]">Kategori</TableHead>
                                            <TableHead className="w-[11rem]">Penerima</TableHead>
                                            <TableHead className="w-[13rem]">Paket / Sub Keg.</TableHead>
                                            <TableHead className="w-[7rem]">Bruto</TableHead>
                                            <TableHead className="w-[6rem]">Status</TableHead>
                                            <TableHead className="w-[12rem]">Penyedia</TableHead>
                                            <TableHead className="w-[12rem]">Pekerjaan</TableHead>
                                            <TableHead className="w-[4.5rem] text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pagedRows.map((row) => {
                                            const key = rowKey(row)
                                            return (
                                                <TableRow key={key} className="align-top">
                                                    <TableCell className="py-2.5 text-xs text-muted-foreground">
                                                        {row.index}
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        {kategoriBadge(row.kategori)}
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        <div
                                                            className="truncate text-sm font-medium"
                                                            title={row.namaPenerima}
                                                        >
                                                            {row.namaPenerima}
                                                        </div>
                                                        <div className="truncate text-xs text-muted-foreground">
                                                            {row.tanggalPencairan}
                                                            {row.persenPembayaran != null
                                                                ? ` · ${row.persenPembayaran}%`
                                                                : ''}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        <div
                                                            className="truncate text-sm"
                                                            title={row.paketHint || undefined}
                                                        >
                                                            {row.paketHint || '—'}
                                                        </div>
                                                        {(row.matchedSubKegiatan || row.subKegiatanHint) && (
                                                            <div
                                                                className="mt-0.5 truncate text-[11px] text-sky-700 dark:text-sky-300"
                                                                title={
                                                                    row.matchedSubKegiatan?.label ||
                                                                    row.subKegiatanHint
                                                                }
                                                            >
                                                                {row.matchedSubKegiatan?.label ||
                                                                    row.subKegiatanHint}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-2.5 whitespace-nowrap text-sm tabular-nums">
                                                        {formatRupiah(row.bruto)}
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        {statusBadge(row.status)}
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        <MatchOverrideCell
                                                            label={row.matchedPenyedia?.label}
                                                            score={row.matchedPenyedia?.score}
                                                            emptyLabel="Pilih penyedia…"
                                                            disabled={row.status === 'skipped'}
                                                            onClick={() =>
                                                                setOverrideTarget({ key, kind: 'penyedia' })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-2.5">
                                                        <MatchOverrideCell
                                                            label={row.matchedPekerjaan?.label}
                                                            score={row.matchedPekerjaan?.score}
                                                            emptyLabel="Pilih pekerjaan…"
                                                            disabled={row.status === 'skipped'}
                                                            onClick={() =>
                                                                setOverrideTarget({ key, kind: 'pekerjaan' })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                                                        {row.realisasiTerhadapKontrak != null
                                                            ? `${row.realisasiTerhadapKontrak}%`
                                                            : '—'}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                        {pagedRows.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    className="py-10 text-center text-muted-foreground"
                                                >
                                                    Tidak ada baris untuk filter ini.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {filtered.length > DETAIL_PAGE_SIZE && (
                                    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {(safeDetailPage - 1) * DETAIL_PAGE_SIZE + 1}–
                                            {Math.min(safeDetailPage * DETAIL_PAGE_SIZE, filtered.length)} dari{' '}
                                            {filtered.length}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={safeDetailPage <= 1}
                                                onClick={() => setDetailPage((p) => Math.max(1, p - 1))}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="tabular-nums">
                                                {safeDetailPage}/{detailPageCount}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={safeDetailPage >= detailPageCount}
                                                onClick={() =>
                                                    setDetailPage((p) => Math.min(detailPageCount, p + 1))
                                                }
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                <MatchOverrideDialog
                    open={overrideTarget != null}
                    onOpenChange={(open) => {
                        if (!open) setOverrideTarget(null)
                    }}
                    title={
                        overrideTarget?.kind === 'pekerjaan' ? 'Pilih pekerjaan' : 'Pilih penyedia'
                    }
                    description={
                        overrideRow
                            ? `${overrideRow.namaPenerima} · ${overrideRow.paketHint || overrideRow.keterangan.slice(0, 80)}${
                                  overrideTarget?.kind === 'penyedia' && overrideRow.matchedPekerjaan
                                      ? ' · hanya penyedia di kontrak paket ini'
                                      : overrideTarget?.kind === 'pekerjaan' && overrideRow.matchedPenyedia
                                        ? ' · hanya paket yang kontraknya ke penyedia ini'
                                        : ''
                              }`
                            : undefined
                    }
                    candidates={
                        overrideTarget?.kind === 'pekerjaan'
                            ? (overrideRow?.candidatesPekerjaan ?? [])
                            : (overrideRow?.candidatesPenyedia ?? [])
                    }
                    current={
                        overrideTarget?.kind === 'pekerjaan'
                            ? (overrideRow?.matchedPekerjaan ?? null)
                            : (overrideRow?.matchedPenyedia ?? null)
                    }
                    catalog={
                        overrideTarget?.kind === 'pekerjaan'
                            ? pekerjaanOptions.filter((p) => {
                                  const full = pekerjaanQuery.data?.find((x) => x.id === p.id)
                                  if (!full) return false
                                  // Prefer paket on same sub kegiatan
                                  if (
                                      overrideRow?.matchedSubKegiatan &&
                                      full.kegiatan_id !== overrideRow.matchedSubKegiatan.id
                                  ) {
                                      return false
                                  }
                                  // If penyedia already chosen, only paket that have that penyedia on kontrak
                                  if (overrideRow?.matchedPenyedia) {
                                      return full.penyediaIds.includes(overrideRow.matchedPenyedia.id)
                                  }
                                  // Else only paket that already have a kontrak
                                  return full.kontrak.length > 0
                              })
                            : penyediaOptions.filter((p) => {
                                  // If pekerjaan already chosen, only penyedia on that kontrak
                                  if (overrideRow?.matchedPekerjaan) {
                                      const full = pekerjaanQuery.data?.find(
                                          (x) => x.id === overrideRow.matchedPekerjaan!.id,
                                      )
                                      return full?.penyediaIds.includes(p.id) ?? false
                                  }
                                  return true
                              })
                    }
                    onSelect={handleOverrideSelect}
                />

                <Dialog open={pencairanOpen} onOpenChange={(open) => !applyingPencairan && setPencairanOpen(open)}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Sinkronisasi Progress Pencairan</DialogTitle>
                            <DialogDescription>
                                <strong>Menimpa</strong> riwayat Progress Keuangan → Realisasi (TA {tahun})
                                dengan data SP2D terbaru. Tanggal = pencairan SP2D; persen = kumulatif bruto ÷
                                nilai kontrak (maks 100%). Sinkronisasi ulang akan mengganti realisasi
                                keuangan yang sudah ada. Progress fisik &amp; rencana keuangan tidak diubah.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3">
                            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                <p>
                                    Siap terapkan:{' '}
                                    <strong>
                                        {pencairanPlans.filter((p) => !p.reason && p.entries.length > 0).length}
                                    </strong>{' '}
                                    paket · Dilewati:{' '}
                                    <strong>
                                        {pencairanPlans.filter((p) => p.reason || p.entries.length === 0).length}
                                    </strong>
                                </p>
                                {applyingPencairan && (
                                    <p className="mt-1 text-muted-foreground">
                                        Menyimpan… {applyProgress.done}/{applyProgress.total}
                                    </p>
                                )}
                            </div>

                            <div className="max-h-[50vh] overflow-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paket</TableHead>
                                            <TableHead className="text-right">#</TableHead>
                                            <TableHead className="text-right">Bruto</TableHead>
                                            <TableHead className="text-right">% akhir</TableHead>
                                            <TableHead>Catatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pencairanPlans.map((plan) => (
                                            <TableRow key={plan.pekerjaanId}>
                                                <TableCell className="max-w-[220px] text-sm font-medium">
                                                    {plan.namaPaket}
                                                    {plan.penyediaLabel ? (
                                                        <div className="text-xs font-normal text-muted-foreground">
                                                            {plan.penyediaLabel}
                                                        </div>
                                                    ) : null}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">{plan.sp2dCount}</TableCell>
                                                <TableCell className="text-right text-sm tabular-nums">
                                                    {formatRupiah(plan.totalBruto)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm tabular-nums">
                                                    {plan.entries.length ? (
                                                        <>
                                                            {plan.finalPersen}%
                                                            {plan.capped ? (
                                                                <span className="ml-1 text-amber-600" title={`Mentah ${plan.uncappedPersen}%`}>
                                                                    *
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[180px] text-xs text-muted-foreground">
                                                    {plan.reason
                                                        ? plan.reason
                                                        : `${plan.entries.length} tanggal${
                                                              plan.skippedNoDate
                                                                  ? ` · ${plan.skippedNoDate} tanpa tgl`
                                                                  : ''
                                                          }`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={applyingPencairan}
                                onClick={() => setPencairanOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={
                                    applyingPencairan ||
                                    !pencairanPlans.some((p) => !p.reason && p.entries.length > 0)
                                }
                                onClick={() => void confirmApplyPencairan()}
                            >
                                {applyingPencairan ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Banknote className="mr-2 h-4 w-4" />
                                )}
                                Simpan ke Progress
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Main>
        </>
    )
}

function SummaryChip({
    label,
    value,
    tone,
}: {
    label: string
    value: string
    tone?: 'success' | 'warn' | 'danger'
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{label}</CardDescription>
                <CardTitle
                    className={cn(
                        'text-xl',
                        tone === 'success' && 'text-emerald-600',
                        tone === 'warn' && 'text-amber-600',
                        tone === 'danger' && 'text-red-600',
                    )}
                >
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    )
}
