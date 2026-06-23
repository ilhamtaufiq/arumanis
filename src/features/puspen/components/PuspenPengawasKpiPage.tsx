import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Award, Camera, Target, TrendingUp, Users, Search, RefreshCw, Trophy } from 'lucide-react'
import { getPuspenPengawasKpi, type PengawasKpiItem } from '../api/pengawas-kpi'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { puspenBorder, puspenLabel, puspenShadowLg, puspenShadowMd, puspenShadowSm } from '../lib/tokens'

const currentYear = new Date().getFullYear()

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n)
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="inline-flex items-center gap-1 bg-[#FFD700] px-2.5 py-0.5 text-[#111111] border-[3px] border-[#111111] font-black shadow-[2px_2px_0_0_#111111]">
                <Trophy className="h-3.5 w-3.5" /> #1
            </div>
        )
    }
    if (rank === 2) {
        return (
            <div className="inline-flex items-center gap-1 bg-[#C0C0C0] px-2.5 py-0.5 text-[#111111] border-[3px] border-[#111111] font-black shadow-[2px_2px_0_0_#111111]">
                #2
            </div>
        )
    }
    if (rank === 3) {
        return (
            <div className="inline-flex items-center gap-1 bg-[#CD7F32] px-2.5 py-0.5 text-[#111111] border-[3px] border-[#111111] font-black shadow-[2px_2px_0_0_#111111]">
                #3
            </div>
        )
    }
    return (
        <div className={`inline-flex px-2.5 py-0.5 border-[3px] border-[#111111] font-black bg-[#FFF7E8] text-[#111111]`}>
            #{rank}
        </div>
    )
}

export function PuspenPengawasKpiPage() {
    const tool = PUSPEN_TOOLS.pengawasKpi

    const [tahun, setTahun] = useState(currentYear)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const perPage = 15

    const query = useQuery({
        queryKey: ['puspen-pengawas-kpi', tahun, search.trim(), page],
        queryFn: () => getPuspenPengawasKpi({
            tahun,
            search: search.trim() || undefined,
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

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            title={tool.title}
            description="Peringkat (Hall of Fame) pengawas berdasarkan input data di tab Output, Penerima, Foto, dan Laporan Progress Fisik pada pekerjaan-pekerjaan yang diawasi."
            eyebrow={
                <span className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    KPI &amp; Aktivitas
                </span>
            }
        >
            {/* Controls */}
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <div>
                    <div className={`${puspenLabel} text-[#111111]/60 mb-1`}>Tahun Anggaran</div>
                    <input
                        type="number"
                        value={tahun}
                        onChange={(e) => handleTahunChange(parseInt(e.target.value) || currentYear)}
                        className={`w-28 bg-white px-3 py-2 text-lg font-black ${puspenBorder} focus:bg-[#8ECAE6] outline-none`}
                        min={2020}
                        max={currentYear + 1}
                    />
                </div>

                <div className="flex-1 min-w-[220px]">
                    <div className={`${puspenLabel} text-[#111111]/60 mb-1`}>Cari Pengawas</div>
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Nama atau NIP..."
                            className={`w-full bg-white pl-9 pr-3 py-2 font-black ${puspenBorder} focus:bg-[#8ECAE6] outline-none`}
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#111111]/50" />
                    </div>
                </div>

                <button
                    onClick={() => query.refetch()}
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-[#FFF7E8] ${puspenBorder} ${puspenShadowSm} font-black uppercase tracking-[0.18em] hover:bg-[#FFB703] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                    disabled={query.isFetching}
                >
                    <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
                    REFRESH
                </button>
            </div>

            {/* Summary bar */}
            <div className={`mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3`}>
                <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-[#111111]/60`}>Pengawas Aktif (dengan data)</div>
                    <div className="text-3xl font-black mt-1">{summary?.total_pengawas ?? 0}</div>
                </div>
                <div className={`bg-[#7C3AED] text-white p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-white/70`}>Tahun</div>
                    <div className="text-3xl font-black mt-1">{tahun}</div>
                </div>
                <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                    <div className={`${puspenLabel} text-[#111111]/60`}>Metrik Penilaian</div>
                    <div className="text-sm font-black mt-1 leading-tight">
                        Foto + Penerima + Output×2 + Progress Fisik×2
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className={`bg-[#FFFFFF] ${puspenBorder} ${puspenShadowLg} overflow-hidden`}>
                <div className="flex items-center justify-between border-b-[3px] border-[#111111] bg-[#1A1A2E] px-4 py-3 text-[#FFB703]">
                    <div className="flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                        <Trophy className="h-5 w-5" /> HALL OF FAME — PENGawAS TERBAIK
                    </div>
                    <div className={`${puspenLabel} text-[#FFB703]/70`}>
                        {items.length} dari {meta?.total ?? 0}
                    </div>
                </div>

                {query.isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <RefreshCw className="h-8 w-8 animate-spin text-[#111111]/40" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-[#111111]/60">
                        Tidak ada data pengawas dengan pekerjaan yang diawasi untuk filter ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[920px] border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#FFF7E8] text-left uppercase tracking-[0.16em] text-[#111111]/70">
                                    <th className="w-14 border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black">Rank</th>
                                    <th className="border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black">Pengawas</th>
                                    <th className="w-20 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-right font-black">Pekerjaan</th>
                                    <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black">
                                        <Camera className="mx-auto h-4 w-4" /> Foto
                                    </th>
                                    <th className="w-20 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black">
                                        <Users className="mx-auto h-4 w-4" /> Penerima
                                    </th>
                                    <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black">
                                        <Target className="mx-auto h-4 w-4" /> Output
                                    </th>
                                    <th className="w-28 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black">
                                        <TrendingUp className="mx-auto h-4 w-4" /> Progress Fisik
                                    </th>
                                    <th className="w-24 border-b-[3px] border-[#111111] p-3 text-right font-black">SKOR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b border-[#111111]/30 hover:bg-[#FFF7E8]/60">
                                        <td className="border-r-[3px] border-[#111111] p-3 align-middle">
                                            <RankBadge rank={item.rank} />
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 font-black">
                                            <div>{item.nama}</div>
                                            {item.nip && (
                                                <div className="text-[10px] font-bold tracking-[0.1em] text-[#111111]/50">{item.nip}</div>
                                            )}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-right font-black tabular-nums">
                                            {formatNumber(item.pekerjaan_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#1A1A2E]">
                                            {formatNumber(item.foto_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums">
                                            {formatNumber(item.penerima_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums">
                                            {formatNumber(item.output_count)}
                                        </td>
                                        <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#2ECC71]">
                                            {formatNumber(item.fisik_count)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className={`inline-block min-w-[62px] border-[3px] border-[#111111] bg-[#7C3AED] px-3 py-1 text-right text-lg font-black text-white ${puspenShadowSm}`}>
                                                {item.score.toFixed(1)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-sm font-black">
                    <div className={`${puspenLabel} text-[#111111]/60`}>
                        Hal {page} / {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className={`px-4 py-1.5 ${puspenBorder} ${puspenShadowSm} bg-[#FFF7E8] uppercase tracking-[0.18em] disabled:opacity-40`}
                        >
                            ← SEBELUM
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className={`px-4 py-1.5 ${puspenBorder} ${puspenShadowSm} bg-[#FFF7E8] uppercase tracking-[0.18em] disabled:opacity-40`}
                        >
                            BERIKUT →
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/50">
                Skor = (Foto × 1) + (Penerima × 1) + (Output × 2) + (Progress Fisik × 2).<br />
                Berdasarkan jumlah data yang diinput di tab Output, Penerima, Foto, dan Laporan Progress Fisik pada pekerjaan-pekerjaan yang diawasi (pengawas/pendamping).
            </div>
        </PuspenToolLayout>
    )
}
