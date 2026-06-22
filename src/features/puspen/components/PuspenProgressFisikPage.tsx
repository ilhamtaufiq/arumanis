import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, FileDown, FileSpreadsheet, RefreshCw, Save, Search, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import {
    getPublicPuspenProgressFisik,
    getPuspenProgressFisik,
    savePublicPuspenProgressFisik,
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

export function PuspenProgressFisikPage() {
    const queryClient = useQueryClient()
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const tool = PUSPEN_TOOLS.progressFisik
    const isPublicView = !auth.accessToken
    const [tahun, setTahun] = useState(currentYear)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [showAll, setShowAll] = useState(false)
    const [drafts, setDrafts] = useState<Record<number, EditableValue>>({})
    const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
    const perPage = showAll ? 1000 : 15

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

    useEffect(() => {
        const nextDrafts = Object.fromEntries(
            (progressQuery.data?.data ?? []).map((item) => [
                item.kontrakId,
                {
                    rencana: toInputValue(item.rencana),
                    realisasi: toInputValue(item.realisasi),
                },
            ])
        )

        setDrafts(nextDrafts)
    }, [progressQuery.data])

    const saveMutation = useMutation({
        mutationFn: () => {
            const items = Object.entries(drafts).map(([kontrakId, values]) => ({
                kontrak_id: Number(kontrakId),
                rencana: parsePercent(values.rencana),
                realisasi: parsePercent(values.realisasi),
            }))

            return isPublicView
                ? savePublicPuspenProgressFisik({ items })
                : savePuspenProgressFisik({ tahun, items })
        },
        onSuccess: async () => {
            toast.success('Estimasi progress fisik berhasil disimpan')
            await queryClient.invalidateQueries({ queryKey: ['puspen-progress-fisik'] })
        },
        onError: () => {
            toast.error('Gagal menyimpan estimasi progress fisik')
        },
    })

    const rows = progressQuery.data?.data ?? []
    const meta = progressQuery.data?.meta
    const totalPages = meta?.last_page ?? 1
    const totalRows = meta?.total ?? rows.length
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
        value: string
    ) => {
        setDrafts((current) => ({
            ...current,
            [kontrakId]: {
                ...(current[kontrakId] ?? { rencana: '', realisasi: '' }),
                [field]: sanitizePercentInput(value),
            },
        }))
    }

    const fetchAllData = async () => {
        const perPage = 1000
        const searchTerm = search.trim() || undefined
        let page = 1
        let allData: PuspenProgressFisikItem[] = []

        while (true) {
            const result = isPublicView
                ? await getPublicPuspenProgressFisik({ search: searchTerm, page, per_page: perPage })
                : await getPuspenProgressFisik({ tahun, search: searchTerm, page, per_page: perPage })

            allData = allData.concat(result.data ?? [])

            const meta = result.meta
            if (!meta || page >= meta.last_page) break
            page++
        }

        return allData
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
                            className="h-10 w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6]"
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
                            className="h-10 w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-3 text-right font-black outline-none shadow-[2px_2px_0_0_#111111] focus:bg-[#8ECAE6]"
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
                        {formatTimestamp(item.updatedAt)}
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
            description="Estimasi progress fisik per kontrak. Nama paket diambil dari data Kontrak, rencana dan realisasi diinput manual, deviasi dihitung otomatis."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            HUD
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            Tahun {tahun}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Filter tahun anggaran default mengikuti tahun berjalan. Ubah tahun untuk melihat paket kontrak lain.
                        </p>
                        <div className="mt-3 border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[2px_2px_0_0_#111111]">
                            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]/60">
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
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
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
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
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
                                            <div className="border-[2px] border-[#111111] bg-[#FFB703] p-2">
                                                <div className="uppercase tracking-[0.12em]">Rencana</div>
                                                <div className="mt-1">{formatPercent(item.rencana)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#2ECC71] p-2">
                                                <div className="uppercase tracking-[0.12em]">Realisasi</div>
                                                <div className="mt-1">{formatPercent(item.realisasi)}%</div>
                                            </div>
                                            <div className="border-[2px] border-[#111111] bg-[#FB8500] p-2">
                                                <div className="uppercase tracking-[0.12em]">Deviasi</div>
                                                <div className="mt-1">{formatPercent(item.deviasi)}%</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#111111]/60">
                                            {item.count} paket
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm font-bold text-[#111111]/65">
                                    Belum ada data sub kegiatan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FB8500] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <CheckSquare className="h-4 w-4" />
                            Catatan
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Deviasi = realisasi dikurangi rencana. Nilai negatif berarti realisasi tertinggal dari rencana.
                        </p>
                    </div>
                </>
            )}
        >
            <div className="space-y-5">
                <section className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="space-y-3">
                            <div className="text-sm font-black uppercase tracking-[0.2em]">
                                Filter Estimasi
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[140px_minmax(220px,320px)_auto]">
                            <label className="block">
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]/70">
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
                                <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#111111]/70">
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
                            <button
                                type="button"
                                onClick={() => saveMutation.mutate()}
                                disabled={saveMutation.isPending || rows.length === 0}
                                className="inline-flex h-12 items-center justify-center gap-2 self-end border-[3px] border-[#111111] bg-[#2ECC71] px-5 font-black uppercase tracking-[0.12em] text-[#111111] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saveMutation.isPending ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Simpan
                            </button>
                        </div>
                    </div>
                    {isPublicView ? (
                        <div className="mt-4 border-[3px] border-[#111111] bg-[#8ECAE6] p-3 text-sm font-bold shadow-[3px_3px_0_0_#111111]">
                            Mode publik aktif. Tahun anggaran dikunci oleh admin, tetapi rencana dan realisasi bisa diinput lalu disimpan.
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
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            Rencana
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
                                            Realisasi
                                        </th>
                                        <th className="border-r-[3px] border-b-[3px] border-[#111111] px-3 py-3 text-center font-black text-[#111111]">
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
