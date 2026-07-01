import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, CheckSquare, CloudUpload, FileDown, FileSpreadsheet, Loader2, RefreshCw, Search, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import {
    getPublicPuspenProgressFisik,
    getPuspenProgressFisik,
    savePuspenProgressFisik,
    type PuspenProgressFisikItem,
} from '../api/progress-fisik'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { exportProgressFisikPdf } from '../utils/export-pdf'
import { exportProgressFisikExcel } from '../utils/export-excel'

type EditableValue = {
    rencana: string
    realisasi: string
}

type RowSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const AUTO_SAVE_DELAY_MS = 700
const currentYear = new Date().getFullYear()

const toInputValue = (value: number | null) => (value === null || value === undefined ? '' : String(value))

const parsePercent = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim()
    if (normalized === '') return null

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

const sanitizePercentInput = (value: string) => {
    let sanitized = value.replace(/[^0-9,.]/g, '')
    const firstSeparatorIndex = sanitized.search(/[,.]/)

    if (firstSeparatorIndex !== -1) {
        const beforeSeparator = sanitized.slice(0, firstSeparatorIndex)
        const separator = sanitized[firstSeparatorIndex]
        const afterSeparator = sanitized
            .slice(firstSeparatorIndex + 1)
            .replace(/[,.]/g, '')

        sanitized = `${beforeSeparator}${separator}${afterSeparator}`
    }

    return sanitized
}

const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value)
}

const formatTimestamp = (value: string | null | undefined) => {
    if (!value) return '-'
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const calculateDeviation = (values: EditableValue) => {
    const rencana = parsePercent(values.rencana)
    const realisasi = parsePercent(values.realisasi)

    if (rencana === null || realisasi === null) return null
    return Number((realisasi - rencana).toFixed(2))
}

const valuesEqual = (left: EditableValue, right: EditableValue) => (
    left.rencana === right.rencana && left.realisasi === right.realisasi
)

const isDraftValid = (values: EditableValue) => {
    for (const raw of [values.rencana, values.realisasi]) {
        const trimmed = raw.trim()
        if (trimmed === '') continue

        const parsed = parsePercent(trimmed)
        if (parsed === null || parsed < 0 || parsed > 100) {
            return false
        }
    }

    return true
}

const toBaseline = (item: PuspenProgressFisikItem): EditableValue => ({
    rencana: toInputValue(item.rencana),
    realisasi: toInputValue(item.realisasi),
})

export function PuspenProgressFisikPage() {
    const queryClient = useQueryClient()
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.progressFisik
    const isPublicView = !auth.isSessionActive
    const [tahun, setTahun] = useState(currentYear)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [showAll, setShowAll] = useState(false)
    const [drafts, setDrafts] = useState<Record<number, EditableValue>>({})
    const [baselines, setBaselines] = useState<Record<number, EditableValue>>({})
    const [rowStatus, setRowStatus] = useState<Record<number, RowSaveStatus>>({})
    const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
    const [isManualSyncing, setIsManualSyncing] = useState(false)
    const draftsRef = useRef(drafts)
    const baselinesRef = useRef(baselines)
    const saveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
    const savedResetTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
    const perPage = showAll ? 1000 : 15

    draftsRef.current = drafts
    baselinesRef.current = baselines

    useEffect(() => {
        if (isPublicView) {
            setTahun(Number(tahunAnggaran) || currentYear)
        }
    }, [isPublicView, tahunAnggaran])

    useEffect(() => {
        setPage(1)
    }, [tahun, search, showAll])

    const progressQuery = useQuery({
        queryKey: ['puspen-progress-fisik', isPublicView ? 'public' : 'auth', tahun, search, page, perPage],
        queryFn: () => (
            isPublicView
                ? getPublicPuspenProgressFisik({ search: search.trim() || undefined, page, per_page: perPage })
                : getPuspenProgressFisik({ tahun, search: search.trim() || undefined, page, per_page: perPage })
        ),
    })

    const rows = progressQuery.data?.data ?? []
    const meta = progressQuery.data?.meta
    const totalPages = meta?.last_page ?? 1
    const totalRows = meta?.total ?? rows.length

    const fetchAllData = useCallback(async () => {
        const batchSize = 1000
        const searchTerm = search.trim() || undefined
        let currentPage = 1
        let allData: PuspenProgressFisikItem[] = []

        while (true) {
            const result = isPublicView
                ? await getPublicPuspenProgressFisik({ search: searchTerm, page: currentPage, per_page: batchSize })
                : await getPuspenProgressFisik({ tahun, search: searchTerm, page: currentPage, per_page: batchSize })

            allData = allData.concat(result.data ?? [])

            const resultMeta = result.meta
            if (!resultMeta || currentPage >= resultMeta.last_page) break
            currentPage++
        }

        return allData
    }, [isPublicView, search, tahun])

    useEffect(() => {
        const items = progressQuery.data?.data ?? []
        if (items.length === 0) return

        setBaselines((current) => {
            const next = { ...current }
            items.forEach((item) => {
                const status = rowStatus[item.kontrakId]
                if (status === 'pending' || status === 'saving') return
                next[item.kontrakId] = toBaseline(item)
            })
            return next
        })

        setDrafts((current) => {
            const next = { ...current }
            items.forEach((item) => {
                const status = rowStatus[item.kontrakId]
                if (status === 'pending' || status === 'saving') return
                next[item.kontrakId] = toBaseline(item)
            })
            return next
        })
    }, [progressQuery.data, rowStatus])

    useEffect(() => () => {
        Object.values(saveTimersRef.current).forEach(clearTimeout)
        Object.values(savedResetTimersRef.current).forEach(clearTimeout)
    }, [])

    const saveRow = useCallback(async (kontrakId: number) => {
        if (isPublicView) return

        const draft = draftsRef.current[kontrakId]
        const baseline = baselinesRef.current[kontrakId]
        if (!draft || !baseline) return

        if (valuesEqual(draft, baseline)) {
            setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
            return
        }

        if (!isDraftValid(draft)) {
            return
        }

        setRowStatus((current) => ({ ...current, [kontrakId]: 'saving' }))

        try {
            await savePuspenProgressFisik({
                tahun,
                items: [{
                    kontrak_id: kontrakId,
                    rencana: parsePercent(draft.rencana),
                    realisasi: parsePercent(draft.realisasi),
                }],
            })

            setBaselines((current) => ({
                ...current,
                [kontrakId]: { ...draft },
            }))
            setRowStatus((current) => ({ ...current, [kontrakId]: 'saved' }))

            if (savedResetTimersRef.current[kontrakId]) {
                clearTimeout(savedResetTimersRef.current[kontrakId])
            }
            savedResetTimersRef.current[kontrakId] = setTimeout(() => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
            }, 2000)

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] }),
                queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi'] }),
            ])
        } catch {
            setRowStatus((current) => ({ ...current, [kontrakId]: 'error' }))
            toast.error('Gagal menyimpan progress fisik. Periksa kembali nilai rencana/realisasi.')
        }
    }, [isPublicView, queryClient, tahun])

    const handleSyncUlang = useCallback(async () => {
        if (isPublicView || isManualSyncing) return

        Object.values(saveTimersRef.current).forEach(clearTimeout)
        saveTimersRef.current = {}

        setIsManualSyncing(true)

        try {
            const allItems = await fetchAllData()

            if (allItems.length === 0) {
                toast.info('Tidak ada kontrak untuk disinkronkan ulang.')
                return
            }

            const targets = allItems.map((item) => ({
                kontrakId: item.kontrakId,
                draft: draftsRef.current[item.kontrakId] ?? toBaseline(item),
            }))

            const invalidTarget = targets.find(({ draft }) => !isDraftValid(draft))
            if (invalidTarget) {
                toast.error('Ada nilai rencana/realisasi tidak valid. Perbaiki sebelum sync ulang.')
                return
            }

            targets.forEach(({ kontrakId }) => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'saving' }))
            })

            await savePuspenProgressFisik({
                tahun,
                items: targets.map(({ kontrakId, draft }) => ({
                    kontrak_id: kontrakId,
                    rencana: parsePercent(draft.rencana),
                    realisasi: parsePercent(draft.realisasi),
                })),
            })

            setBaselines((current) => {
                const next = { ...current }
                targets.forEach(({ kontrakId, draft }) => {
                    next[kontrakId] = { ...draft }
                })
                return next
            })

            targets.forEach(({ kontrakId }) => {
                setRowStatus((current) => ({ ...current, [kontrakId]: 'saved' }))
                if (savedResetTimersRef.current[kontrakId]) {
                    clearTimeout(savedResetTimersRef.current[kontrakId])
                }
                savedResetTimersRef.current[kontrakId] = setTimeout(() => {
                    setRowStatus((current) => ({ ...current, [kontrakId]: 'idle' }))
                }, 2000)
            })

            toast.success(
                `${targets.length} kontrak disinkronkan ulang ke tab Progress pekerjaan terkait.`,
            )

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] }),
                queryClient.invalidateQueries({ queryKey: ['pekerjaan-progress-estimasi'] }),
            ])
        } catch {
            toast.error('Gagal sync ulang. Coba lagi.')
        } finally {
            setIsManualSyncing(false)
        }
    }, [
        fetchAllData,
        isManualSyncing,
        isPublicView,
        queryClient,
        tahun,
    ])

    const scheduleRowSave = useCallback((kontrakId: number, immediate = false) => {
        if (isPublicView) return

        if (saveTimersRef.current[kontrakId]) {
            clearTimeout(saveTimersRef.current[kontrakId])
        }

        setRowStatus((current) => ({
            ...current,
            [kontrakId]: current[kontrakId] === 'saving' ? 'saving' : 'pending',
        }))

        const runSave = () => {
            delete saveTimersRef.current[kontrakId]
            void saveRow(kontrakId)
        }

        if (immediate) {
            runSave()
            return
        }

        saveTimersRef.current[kontrakId] = setTimeout(runSave, AUTO_SAVE_DELAY_MS)
    }, [isPublicView, saveRow])

    const summary = progressQuery.data?.summary ?? {
        count: 0,
        rencana: 0,
        realisasi: 0,
        deviasi: 0,
        latestUpdatedAt: null,
        perSubKegiatan: [],
    }

    const handleDraftChange = (
        kontrakId: number,
        field: keyof EditableValue,
        value: string,
    ) => {
        setDrafts((current) => ({
            ...current,
            [kontrakId]: {
                ...(current[kontrakId] ?? { rencana: '', realisasi: '' }),
                [field]: sanitizePercentInput(value),
            },
        }))
        scheduleRowSave(kontrakId)
    }

    const handleDraftBlur = (kontrakId: number) => {
        scheduleRowSave(kontrakId, true)
    }

    const renderRowSaveStatus = (kontrakId: number) => {
        const status = rowStatus[kontrakId] ?? 'idle'

        if (status === 'saving') {
            return (
                <span className="inline-flex items-center gap-1 text-[#111111]/70">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Simpan...
                </span>
            )
        }

        if (status === 'pending') {
            return <span className="text-[#FB8500]">Menunggu...</span>
        }

        if (status === 'saved') {
            return (
                <span className="inline-flex items-center gap-1 text-[#1B7F43]">
                    <Check className="h-3.5 w-3.5" />
                    Tersimpan
                </span>
            )
        }

        if (status === 'error') {
            return <span className="text-[#EF233C]">Gagal</span>
        }

        return <span className="text-[#111111]/45">Auto</span>
    }

    const handleExport = async (format: 'pdf' | 'excel') => {
        setExporting(format)
        try {
            const allData = await fetchAllData()

            if (!allData.length) {
                toast.error('Tidak ada data untuk diexport')
                return
            }

            if (format === 'pdf') {
                exportProgressFisikPdf({ items: allData, tahun })
            } else {
                exportProgressFisikExcel({ items: allData, tahun })
            }
        } catch {
            toast.error(`Gagal export ${format.toUpperCase()}`)
        } finally {
            setExporting(null)
        }
    }

    const renderRows = () => {
        if (progressQuery.isLoading) {
            return (
                <tr>
                    <td colSpan={8} className="h-36 text-center">
                        <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
                    </td>
                </tr>
            )
        }

        if (rows.length === 0) {
            return (
                <tr>
                    <td colSpan={8} className="h-36 text-center text-sm font-bold">
                        Tidak ada kontrak pada tahun anggaran ini.
                    </td>
                </tr>
            )
        }

        return rows.map((item: PuspenProgressFisikItem, index) => {
            const draft = drafts[item.kontrakId] ?? { rencana: '', realisasi: '' }
            const deviasi = calculateDeviation(draft)

            return (
                <tr key={item.kontrakId} className="border-b-[3px] border-[#111111]">
                    <td className="w-14 border-r-[3px] border-[#111111] px-3 py-3 text-center font-black">
                        {index + 1}
                    </td>
                    <td className="min-w-[360px] border-r-[3px] border-[#111111] px-4 py-3 font-bold">
                        <div className="space-y-1">
                            <div>{item.namaPaket || '-'}</div>
                            <div className="text-xs uppercase tracking-[0.16em] text-[#111111]/55">
                                {item.kodePaket || 'Tanpa kode paket'}
                            </div>
                        </div>
                    </td>
                    <td className="min-w-[280px] border-r-[3px] border-[#111111] px-4 py-3 font-bold">
                        {item.subKegiatan || '-'}
                    </td>
                    <td className="w-40 border-r-[3px] border-[#111111] px-3 py-3">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[,.]?[0-9]*"
                            value={draft.rencana}
                            onChange={(event) => handleDraftChange(item.kontrakId, 'rencana', event.target.value)}
                            onBlur={() => handleDraftBlur(item.kontrakId)}
                            disabled={isPublicView}
                            className="h-10 w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                            placeholder="0"
                        />
                    </td>
                    <td className="w-40 border-r-[3px] border-[#111111] px-3 py-3">
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[,.]?[0-9]*"
                            value={draft.realisasi}
                            onChange={(event) => handleDraftChange(item.kontrakId, 'realisasi', event.target.value)}
                            onBlur={() => handleDraftBlur(item.kontrakId)}
                            disabled={isPublicView}
                            className="h-10 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                            placeholder="0"
                        />
                    </td>
                    <td
                        className={`w-40 border-r-[3px] border-[#111111] px-4 py-3 text-right font-black ${
                            deviasi !== null && deviasi < 0 ? 'text-[#EF233C]' : 'text-[#1B7F43]'
                        }`}
                    >
                        {formatPercent(deviasi)}
                    </td>
                    <td className="min-w-[170px] border-r-[3px] border-[#111111] px-3 py-3 text-xs font-black">
                        <div>{formatTimestamp(item.updatedAt)}</div>
                        {!isPublicView ? (
                            <div className="mt-1 text-[10px] uppercase tracking-[0.12em]">
                                {renderRowSaveStatus(item.kontrakId)}
                            </div>
                        ) : null}
                    </td>
                    <td className="w-16 px-3 py-3 text-center font-black">%</td>
                </tr>
            )
        })
    }

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            playerName={isPublicView ? undefined : auth.user?.name}
            showHubBack={!isPublicView}
            showDashboardExit={!isPublicView}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {isPublicView ? 'Mode Publik' : 'Progress Fisik'}
                </span>
            )}
            title={isPublicView ? 'Progress Fisik Publik' : tool.title}
            description="Estimasi progress fisik per kontrak. Perubahan rencana/realisasi disimpan otomatis dan disinkronkan ke tab Progress pekerjaan."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                            HUD
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Tahun {tahun}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Filter tahun anggaran default mengikuti tahun berjalan. Ubah tahun untuk melihat paket kontrak lain.
                        </p>
                        <div className="mt-3 border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[2px_2px_0_0_#111111]">
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                Latest Update
                            </div>
                            <div className="mt-1 text-sm font-black">
                                {formatTimestamp(summary.latestUpdatedAt)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            ['Rencana', summary.rencana, '#FFB703'],
                            ['Realisasi', summary.realisasi, '#2ECC71'],
                            ['Deviasi', summary.deviasi, '#FB8500'],
                        ].map(([label, value, color]) => (
                            <div
                                key={label as string}
                                className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[3px_3px_0_0_#111111]"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]">
                                            Rata-rata
                                        </div>
                                        <div className="mt-1 text-sm font-black uppercase tracking-[0.08em]">
                                            {label}
                                        </div>
                                    </div>
                                    <div
                                        className="border-[3px] border-[#111111] px-3 py-2 text-lg font-black shadow-[3px_3px_0_0_#111111]"
                                        style={{ backgroundColor: color as string }}
                                    >
                                        {formatPercent(value as number)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]">
                            Rata-rata Per Sub Kegiatan
                        </div>
                        <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
                            {summary.perSubKegiatan.length > 0 ? (
                                summary.perSubKegiatan.map((item) => (
                                    <div
                                        key={item.subKegiatan}
                                        className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[2px_2px_0_0_#111111]"
                                    >
                                        <div className="text-sm font-black leading-5">
                                            {item.subKegiatan}
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-black">
                                            <div className="border-[2px] border-[#111111] bg-[#FFB703] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Rencana</div>
                                                <div className="mt-1">{formatPercent(item.rencana)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#2ECC71] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Realisasi</div>
                                                <div className="mt-1">{formatPercent(item.realisasi)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#FB8500] p-2 text-[#111111]">
                                                <div className="uppercase tracking-[0.12em]">Deviasi</div>
                                                <div className="mt-1">{formatPercent(item.deviasi)}%</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#111111]">
                                            {item.count} paket
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-bold text-[#111111]">
                                    Belum ada data sub kegiatan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FB8500] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                            <CheckSquare className="h-4 w-4" />
                            Catatan
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Deviasi = realisasi dikurangi rencana. Nilai negatif berarti realisasi tertinggal dari rencana. Perubahan tersimpan otomatis ±{AUTO_SAVE_DELAY_MS / 1000} detik setelah input. Sync Ulang memaksa kirim ulang semua kontrak pada filter tahun/pencarian ke tab Progress pekerjaan terkait.
                        </p>
                    </div>
                </>
            )}
        >
            <div className="space-y-5">
                <section className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-3">
                            <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
                                Filter Estimasi
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[140px_minmax(220px,320px)_minmax(200px,auto)]">
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                    Tahun
                                </span>
                                <input
                                    type="number"
                                    min={2000}
                                    max={2100}
                                    value={tahun}
                                    onChange={(event) => setTahun(Number(event.target.value) || currentYear)}
                                    disabled={isPublicView}
                                    className="h-12 w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-4 font-black outline-none shadow-[3px_3px_0_0_#111111] focus:bg-[#8ECAE6] disabled:cursor-not-allowed disabled:opacity-70"
                                    aria-label="Tahun anggaran"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]">
                                    Cari Paket/Sub Kegiatan
                                </span>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="h-12 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 pl-10 font-bold outline-none shadow-[3px_3px_0_0_#111111] focus:bg-[#8ECAE6]"
                                        placeholder="Cari paket atau sub kegiatan"
                                    />
                                </div>
                            </label>
                            {!isPublicView ? (
                                <div className="flex flex-col gap-2 self-end">
                                    <div className="inline-flex h-10 items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 text-xs font-black uppercase tracking-[0.14em] text-[#111111] shadow-[2px_2px_0_0_#111111]">
                                        <CloudUpload className="h-3.5 w-3.5" />
                                        Auto-save aktif
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleSyncUlang()}
                                        disabled={isManualSyncing || totalRows === 0}
                                        className="inline-flex h-12 items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-5 font-black uppercase tracking-[0.12em] text-[#111111] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isManualSyncing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                        Sync Ulang ({totalRows})
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    {isPublicView ? (
                        <div className="mt-4 border-[3px] border-[#111111] bg-[#8ECAE6] p-3 text-sm font-bold shadow-[3px_3px_0_0_#111111]">
                            Mode publik aktif. Tahun anggaran dikunci oleh admin. Login diperlukan untuk menyimpan perubahan.
                        </div>
                    ) : null}
                </section>

                <section className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <TrendingUp className="h-4 w-4" />
                            Tabel Estimasi
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {!isPublicView ? (
                                <button
                                    type="button"
                                    onClick={() => void handleSyncUlang()}
                                    disabled={isManualSyncing || totalRows === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#2ECC71] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isManualSyncing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    Sync Ulang ({totalRows})
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => setShowAll((value) => !value)}
                                className="border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                            >
                                {showAll ? 'Paginasi' : 'Tampilkan Semua'}
                            </button>
                            <div className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111]">
                                {progressQuery.isLoading ? 'Lagi muat...' : `${rows.length} / ${totalRows} paket`}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleExport('pdf')}
                                    disabled={exporting !== null || rows.length === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#EF233C] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {exporting === 'pdf' ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileDown className="h-4 w-4" />
                                    )}
                                    PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExport('excel')}
                                    disabled={exporting !== null || rows.length === 0}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#2ECC71] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#111111] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {exporting === 'excel' ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="h-4 w-4" />
                                    )}
                                    Excel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[3px_3px_0_0_#111111]">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#FB8500]">
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            No
                                        </th>
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-4 py-3 text-left font-black text-[#111111]">
                                            Nama Paket Pekerjaan
                                        </th>
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-4 py-3 text-left font-black text-[#111111]">
                                            Sub Kegiatan
                                        </th>
                                        <th colSpan={3} className="border-r-[3px] border-b-[3px] border-[#111111] px-4 py-3 text-center font-black uppercase tracking-[0.18em] text-[#111111]">
                                            Progress
                                        </th>
                                        <th rowSpan={2} className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            Update
                                        </th>
                                        <th rowSpan={2} className="border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            Satuan
                                        </th>
                                    </tr>
                                    <tr className="bg-[#FFB703]">
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Rencana
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Realisasi
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#1A1A2E]">
                                            Deviasi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{renderRows()}</tbody>
                            </table>
                        </div>
                    </div>

                    {!showAll && totalPages > 1 ? (
                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((value) => Math.max(1, value - 1))}
                                disabled={page <= 1 || progressQuery.isFetching}
                                className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <div className="border-[3px] border-[#111111] bg-[#FFB703] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111]">
                                Hal {page} / {totalPages}
                            </div>
                            <button
                                type="button"
                                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                disabled={page >= totalPages || progressQuery.isFetching}
                                className="border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    ) : null}
                </section>
            </div>
        </PuspenToolLayout>
    )
}
