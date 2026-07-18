import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Award,
    Camera,
    Download,
    FileDown,
    Search,
    RefreshCw,
    Target,
    TrendingUp,
    Trophy,
    Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import {
    getPuspenPengawasKpi,
    getPuspenPengawasKpiNotesReport,
    type PengawasKpiItem,
} from '../api/pengawas-kpi'
import { exportPengawasKpiCsv } from '../lib/export-pengawas-kpi-csv'
import { exportPengawasKpiNotesPdf } from '../lib/export-pengawas-kpi-pdf'
import { fetchAllPengawasKpiItems, getScorePerPekerjaan } from '../lib/pengawas-kpi-utils'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PengawasKpiDetailDialog } from './pengawas-kpi/PengawasKpiDetailDialog'
import { PengawasKpiPodium } from './pengawas-kpi/PengawasKpiPodium'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import {
    PENGAWAS_KPI_PERAN_ALL,
    PENGAWAS_KPI_PERAN_OPTIONS,
    PENGAWAS_KPI_ROLE_LABELS,
    type PengawasKpiPeranFilter,
} from '../lib/pengawas-kpi-peran'
import { puspenBorder, puspenLabel, puspenShadowLg, puspenShadowMd, puspenShadowSm } from '../lib/tokens'

const currentYear = new Date().getFullYear()

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n)
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFD700] px-2.5 py-0.5 font-black text-[#111111] shadow-[2px_2px_0_0_#111111]">
                <Trophy className="h-3.5 w-3.5" aria-hidden /> #{rank}
            </div>
        )
    }
    if (rank === 2) {
        return (
            <div className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#C0C0C0] px-2.5 py-0.5 font-black text-[#111111] shadow-[2px_2px_0_0_#111111]">
                #{rank}
            </div>
        )
    }
    if (rank === 3) {
        return (
            <div className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#CD7F32] px-2.5 py-0.5 font-black text-[#111111] shadow-[2px_2px_0_0_#111111]">
                #{rank}
            </div>
        )
    }
    return (
        <div className="inline-flex border-[3px] border-[#111111] bg-[#FFF7E8] px-2.5 py-0.5 font-black text-[#111111]">
            #{rank}
        </div>
    )
}

function RoleBadges({ roles }: { roles?: string[] }) {
    if (!roles?.length) return null

    return (
        <div className="mt-1.5 flex flex-wrap gap-1">
            {roles.map((role) => (
                <span
                    key={role}
                    className={`inline-block bg-[#1A1A2E] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#FFB703] ${puspenBorder}`}
                >
                    {PENGAWAS_KPI_ROLE_LABELS[role] ?? role}
                </span>
            ))}
        </div>
    )
}

export function PuspenPengawasKpiPage() {
    const tool = PUSPEN_TOOLS.pengawasKpi

    const [tahun, setTahun] = useState(currentYear)
    const [peran, setPeran] = useState<PengawasKpiPeranFilter>(PENGAWAS_KPI_PERAN_ALL)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [selectedItem, setSelectedItem] = useState<PengawasKpiItem | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [isExportingPdf, setIsExportingPdf] = useState(false)
    const perPage = 15

    const debouncedSearch = useDebounce(search.trim(), 400)

    const query = useQuery({
        queryKey: ['puspen-pengawas-kpi', tahun, peran, debouncedSearch, page],
        queryFn: () => getPuspenPengawasKpi({
            tahun,
            search: debouncedSearch || undefined,
            peran: peran || undefined,
            page,
            per_page: perPage,
        }),
    })

    const items: PengawasKpiItem[] = query.data?.data ?? []
    const meta = query.data?.meta
    const summary = query.data?.summary
    const totalPages = meta?.last_page ?? 1

    const handleSearch = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    const handleTahunChange = (value: number) => {
        setTahun(value)
        setPage(1)
    }

    const handlePeranChange = (value: PengawasKpiPeranFilter) => {
        setPeran(value)
        setPage(1)
    }

    const openDetail = (item: PengawasKpiItem) => {
        setSelectedItem(item)
        setDetailOpen(true)
    }

    const handleExportCsv = async () => {
        setIsExporting(true)
        try {
            const rows = await fetchAllPengawasKpiItems({
                tahun,
                search: debouncedSearch || undefined,
                peran: peran || undefined,
            })
            if (rows.length === 0) {
                toast.error('Tidak ada data untuk diekspor')
                return
            }
            exportPengawasKpiCsv(rows, tahun)
            toast.success('Data berhasil diekspor')
        } catch {
            toast.error('Gagal mengekspor data')
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportPdfNotes = async () => {
        setIsExportingPdf(true)
        try {
            const report = await getPuspenPengawasKpiNotesReport({
                tahun,
                search: debouncedSearch || undefined,
                peran: peran || undefined,
            })
            if (!report.data?.length) {
                toast.error('Tidak ada paket pekerjaan untuk diekspor')
                return
            }
            const peranLabel =
                PENGAWAS_KPI_PERAN_OPTIONS.find((o) => o.value === peran)?.label ?? undefined
            exportPengawasKpiNotesPdf({
                rows: report.data,
                tahun: report.tahun,
                peranLabel,
            })
            toast.success(`PDF catatan siap · ${report.total} paket`)
        } catch {
            toast.error('Gagal mengekspor PDF catatan')
        } finally {
            setIsExportingPdf(false)
        }
    }

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            title={tool.title}
            description="Peringkat berbasis kelengkapan data per paket (0–100), bukan volume input. Dimensi: foto (cap target slot), penerima (jika wajib), progress fisik %, dan koordinat GPS. Paket dibatalkan tidak dihitung."
            eyebrow={
                <span className="flex items-center gap-2">
                    <Award className="h-4 w-4" aria-hidden />
                    Indikator Kelengkapan Pengawasan
                </span>
            }
        >
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div>
                    <div className={`${puspenLabel} mb-1 text-[#111111]/60`}>Tahun Anggaran</div>
                    <input
                        type="number"
                        value={tahun}
                        onChange={(e) => handleTahunChange(parseInt(e.target.value, 10) || currentYear)}
                        className={`w-28 bg-white px-3 py-2 text-lg font-black text-[#111111] ${puspenBorder} outline-none focus:bg-[#8ECAE6]`}
                        min={2020}
                        max={currentYear + 1}
                        aria-label="Tahun anggaran"
                    />
                </div>

                <div>
                    <div className={`${puspenLabel} mb-1 text-[#111111]/60`}>Filter Peran</div>
                    <select
                        value={peran}
                        onChange={(e) => handlePeranChange(e.target.value as PengawasKpiPeranFilter)}
                        className={`min-w-[200px] bg-white px-3 py-2 font-black text-[#111111] ${puspenBorder} outline-none focus:bg-[#8ECAE6]`}
                        aria-label="Filter peran pengawas"
                    >
                        {PENGAWAS_KPI_PERAN_OPTIONS.map((option) => (
                            <option key={option.value || 'all'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[220px] flex-1">
                    <div className={`${puspenLabel} mb-1 text-[#111111]/60`}>Cari Nama Pengawas</div>
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Nama atau NIP..."
                            className={`w-full bg-white py-2 pl-9 pr-3 font-black text-[#111111] ${puspenBorder} outline-none focus:bg-[#8ECAE6]`}
                            aria-label="Cari nama pengawas"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#111111]/50" aria-hidden />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => query.refetch()}
                    className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-4 py-2 font-black uppercase tracking-[0.18em] text-[#111111] ${puspenBorder} ${puspenShadowSm} hover:bg-[#FFB703] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                    disabled={query.isFetching}
                >
                    <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} aria-hidden />
                    Muat Ulang
                </button>

                <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={isExporting || isExportingPdf || query.isLoading}
                    className={`inline-flex items-center gap-2 bg-[#2ECC71] px-4 py-2 font-black uppercase tracking-[0.18em] text-[#111111] ${puspenBorder} ${puspenShadowSm} hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50`}
                >
                    <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} aria-hidden />
                    Unduh CSV
                </button>

                <button
                    type="button"
                    onClick={() => void handleExportPdfNotes()}
                    disabled={isExportingPdf || isExporting || query.isLoading}
                    title="PDF: No, Nama Paket, Catatan kelengkapan (progress 100%, PHO vs foto, dll.)"
                    className={`inline-flex items-center gap-2 bg-[#EF233C] px-4 py-2 font-black uppercase tracking-[0.18em] text-white ${puspenBorder} ${puspenShadowSm} hover:brightness-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50`}
                >
                    <FileDown className={`h-4 w-4 ${isExportingPdf ? 'animate-pulse' : ''}`} aria-hidden />
                    PDF Catatan
                </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-[#111111]/60`}>
                        {peran === 'konsultan_pengawas'
                            ? 'Jumlah Konsultan Pengawas'
                            : peran === 'pengawas'
                              ? 'Jumlah Pengawas'
                              : 'Jumlah Pengguna Aktif'}
                    </div>
                    <div className="mt-1 text-3xl font-black text-[#111111]">{summary?.total_pengawas ?? 0}</div>
                </div>
                <div className={`bg-[#7C3AED] p-4 text-white ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-white/70`}>Tahun</div>
                    <div className="mt-1 text-3xl font-black">{tahun}</div>
                </div>
                <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-[#111111]/60`}>Metrik Penilaian (0–100)</div>
                    <div className="mt-1 text-sm font-black leading-tight text-[#111111]">
                        Foto 35% · Penerima 25% · Progress 25% · GPS 15%
                        <span className="mt-1 block text-[10px] font-bold normal-case tracking-normal text-[#111111]/55">
                            Ranking: rata-rata per paket (bukan total volume)
                        </span>
                    </div>
                </div>
            </div>

            {query.isError ? (
                <div className={`mb-4 bg-[#EF233C] p-6 text-center text-white ${puspenBorder} ${puspenShadowMd}`}>
                    <p className="text-sm font-black uppercase tracking-widest">Gagal memuat statistik pengawas.</p>
                    <button
                        type="button"
                        onClick={() => query.refetch()}
                        className={`mt-4 inline-flex items-center gap-2 bg-[#FFF7E8] px-4 py-2 font-black uppercase tracking-[0.16em] text-[#111111] ${puspenBorder} ${puspenShadowSm}`}
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden />
                        Coba Lagi
                    </button>
                </div>
            ) : null}

            {!query.isLoading && !query.isError && page === 1 && debouncedSearch === '' && peran === PENGAWAS_KPI_PERAN_ALL ? (
                <PengawasKpiPodium items={items} onSelect={openDetail} />
            ) : null}

            <div className={`overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowLg}`}>
                <div className="flex items-center justify-between border-b-[3px] border-[#111111] bg-[#1A1A2E] px-4 py-3 text-[#FFB703]">
                    <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                        <Trophy className="h-5 w-5" aria-hidden /> Peringkat Kelengkapan Pengawas
                    </div>
                    <div className={`${puspenLabel} text-[#FFB703]/70`}>
                        {items.length} dari {meta?.total ?? 0}
                    </div>
                </div>

                {query.isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="h-8 w-8 animate-spin text-[#111111]/40" aria-hidden />
                    </div>
                ) : query.isError ? null : items.length === 0 ? (
                    <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-[#111111]/60">
                        Tidak terdapat pengawas dengan pekerjaan terdaftar untuk filter yang dipilih.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#FFF7E8] text-left uppercase tracking-[0.16em] text-[#111111]/70">
                                    <th className="w-14 border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black" scope="col">Peringkat</th>
                                    <th className="border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black" scope="col">Nama Pengawas</th>
                                    <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                        <Camera className="mx-auto h-4 w-4" aria-hidden />
                                        <span className="sr-only">Dokumentasi foto</span>
                                    </th>
                                    <th className="w-20 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                        <Users className="mx-auto h-4 w-4" aria-hidden />
                                        <span className="sr-only">Penerima manfaat</span>
                                    </th>
                                    <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                        <Target className="mx-auto h-4 w-4" aria-hidden />
                                        <span className="sr-only">Output</span>
                                    </th>
                                    <th className="w-28 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                        <TrendingUp className="mx-auto h-4 w-4" aria-hidden />
                                        <span className="sr-only">Progress fisik</span>
                                    </th>
                                    <th className="w-28 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-right font-black" scope="col" title="Rata-rata kelengkapan 0–100">
                                        Rata-rata %
                                    </th>
                                    <th className="w-24 border-b-[3px] border-[#111111] p-3 text-right font-black" scope="col" title="Jumlah skor paket (masing-masing 0–100)">
                                        Σ skor
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="cursor-pointer border-b border-[#111111]/30 hover:bg-[#FFF7E8]/60"
                                        onClick={() => openDetail(item)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                openDetail(item)
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Lihat detail ${item.nama}`}
                                    >
                                        <td className="border-r-[3px] border-[#111111] p-3 align-middle">
                                            <RankBadge rank={item.rank} />
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 font-black text-[#111111]">
                                            <div>{item.nama}</div>
                                            {item.nip ? (
                                                <div className="text-[10px] font-bold tracking-[0.1em] text-[#111111]/50">{item.nip}</div>
                                            ) : null}
                                            <RoleBadges roles={item.roles} />
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#1A1A2E]">
                                            {formatNumber(item.foto_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#111111]">
                                            {formatNumber(item.penerima_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#111111]">
                                            {formatNumber(item.output_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#2ECC71]">
                                            {formatNumber(item.fisik_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-right">
                                            <div className={`inline-block min-w-[62px] border-[3px] border-[#111111] bg-[#7C3AED] px-3 py-1 text-right text-lg font-black text-white ${puspenShadowSm}`}>
                                                {getScorePerPekerjaan(item).toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="p-3 text-right font-black tabular-nums text-[#111111]">
                                            {item.score.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 ? (
                <div className="mt-3 flex items-center justify-between text-sm font-black">
                    <div className={`${puspenLabel} text-[#111111]/60`}>
                        Halaman {page} dari {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className={`bg-[#FFF7E8] px-4 py-1.5 uppercase tracking-[0.18em] text-[#111111] ${puspenBorder} ${puspenShadowSm} disabled:opacity-40`}
                        >
                            ← Sebelumnya
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className={`bg-[#FFF7E8] px-4 py-1.5 uppercase tracking-[0.18em] text-[#111111] ${puspenBorder} ${puspenShadowSm} disabled:opacity-40`}
                        >
                            Berikutnya →
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="mt-6 space-y-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/50">
                <p>
                    Peringkat: rata-rata kelengkapan paket (0–100) → jumlah paket skor ≥70 → Σ skor.
                    Paket canceled dikecualikan.
                </p>
                <p className="normal-case tracking-normal font-bold">
                    Bobot: Foto 35% (cap target slot) · Penerima 25% (jika wajib) · Progress 25% · Koordinat GPS 15%.
                    Konsultan dinilai dari progress saja. Tanpa output, skor dibatasi (progress × 0,5).
                    Klik baris untuk rincian per pekerjaan.
                </p>
            </div>

            <PengawasKpiDetailDialog
                item={selectedItem}
                tahun={tahun}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </PuspenToolLayout>
    )
}