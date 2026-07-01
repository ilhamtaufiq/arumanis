import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    BarChart3,
    Camera,
    ExternalLink,
    FileSearch,
    Loader2,
    Map as MapIcon,
    MapPin,
    RefreshCw,
    RotateCcw,
    Users,
} from 'lucide-react'
import { getPekerjaan, getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan'
import { getPekerjaanProgressEstimasi } from '@/features/pekerjaan/api/progress-estimasi'
import { getKecamatan } from '@/features/kecamatan/api/kecamatan'
import { getDesaByKecamatan } from '@/features/desa/api/desa'
import { getPengawas } from '@/features/pengawas/api/pengawas'
import { getProgressReport } from '@/features/progress/api/progress'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useDebounce } from '@/hooks/use-debounce'
import { formatCurrency } from '@/features/dashboard/lib/format'
import {
    PuspenBadge,
    PuspenButton,
    PuspenDataTable,
    PuspenField,
    PuspenInput,
    PuspenSelect,
} from './PuspenUi'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import {
    buildCompletenessScore,
    buildFotoByKomponen,
    buildFotoByLevel,
    buildFotoMapPoints,
    buildKoordinatDesaSummary,
    buildOutputRows,
    buildProgressEstimasiSummary,
    buildProgressItemChart,
    buildReviewRecommendations,
    buildReviewStats,
    buildWeeklyProgressChart,
    formatFotoStatus,
    type PekerjaanReviewDetail,
} from '../lib/pekerjaan-review-utils'
import { ReviewFotoGallery } from './pekerjaan-review/ReviewFotoGallery'
import { ReviewFotoMap } from './pekerjaan-review/ReviewFotoMap'
import { ReviewInsightsPanel } from './pekerjaan-review/ReviewInsightsPanel'
import { ReviewPaketPicker } from './pekerjaan-review/ReviewPaketPicker'
import { ReviewProgressEstimasiPanel } from './pekerjaan-review/ReviewProgressEstimasiPanel'
import { ReviewStaffInfo } from './pekerjaan-review/ReviewStaffInfo'
import { puspenBorder, puspenLabel, puspenPressable, puspenShadowLg, puspenShadowMd, puspenShadowSm } from '../lib/tokens'

const linkButtonClass = `inline-flex items-center gap-2 bg-[#FFF7E8] px-4 py-2 font-black uppercase tracking-[0.14em] text-[#111111] ${puspenBorder} ${puspenShadowSm} ${puspenPressable} hover:bg-[#8ECAE6]`

const ALL_VALUE = 'all'

function formatPercent(value: number | null | undefined) {
    if (value === null || value === undefined) return '-'
    return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)}%`
}

function StatCard({
    label,
    value,
    hint,
    accent = 'bg-[#FFF7E8]',
}: {
    label: string
    value: string
    hint?: string
    accent?: string
}) {
    return (
        <div className={`${accent} p-4 ${puspenBorder} ${puspenShadowMd}`}>
            <div className={`${puspenLabel} text-[#111111]/55`}>{label}</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-[#111111]">{value}</div>
            {hint ? <p className="mt-1 text-xs font-bold text-[#111111]/65">{hint}</p> : null}
        </div>
    )
}

export function PuspenPekerjaanReviewPage() {
    const tool = PUSPEN_TOOLS.pekerjaanReview
    const { tahunAnggaran } = useAppSettingsValues()

    const [tahun, setTahun] = useState(Number(tahunAnggaran) || new Date().getFullYear())
    const [kecamatanId, setKecamatanId] = useState(ALL_VALUE)
    const [desaId, setDesaId] = useState(ALL_VALUE)
    const [pengawasId, setPengawasId] = useState(ALL_VALUE)
    const [pendampingId, setPendampingId] = useState(ALL_VALUE)
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const debouncedSearch = useDebounce(search.trim(), 350)

    useEffect(() => {
        setDesaId(ALL_VALUE)
    }, [kecamatanId])

    useEffect(() => {
        setSelectedId(null)
    }, [tahun, kecamatanId, desaId, pengawasId, pendampingId])

    const filterParams = useMemo(() => ({
        tahun: String(tahun),
        search: debouncedSearch || undefined,
        kecamatan_id: kecamatanId !== ALL_VALUE ? Number(kecamatanId) : undefined,
        desa_id: desaId !== ALL_VALUE ? Number(desaId) : undefined,
        pengawas_id: pengawasId !== ALL_VALUE ? Number(pengawasId) : undefined,
        pendamping_id: pendampingId !== ALL_VALUE ? Number(pendampingId) : undefined,
        per_page: 200,
        summary: true,
    }), [tahun, debouncedSearch, kecamatanId, desaId, pengawasId, pendampingId])

    const resetFilters = () => {
        setTahun(Number(tahunAnggaran) || new Date().getFullYear())
        setKecamatanId(ALL_VALUE)
        setDesaId(ALL_VALUE)
        setPengawasId(ALL_VALUE)
        setPendampingId(ALL_VALUE)
        setSearch('')
        setSelectedId(null)
    }

    const kecamatanQuery = useQuery({
        queryKey: ['kecamatan-list'],
        queryFn: getKecamatan,
    })

    const desaQuery = useQuery({
        queryKey: ['desa-by-kecamatan', kecamatanId],
        queryFn: () => getDesaByKecamatan(Number(kecamatanId)),
        enabled: kecamatanId !== ALL_VALUE,
    })

    const pengawasQuery = useQuery({
        queryKey: ['pengawas-list'],
        queryFn: getPengawas,
    })

    const listQuery = useQuery({
        queryKey: ['puspen-pekerjaan-review-list', filterParams],
        queryFn: () => getPekerjaan(filterParams),
    })

    const detailQuery = useQuery({
        queryKey: ['puspen-pekerjaan-review-detail', selectedId],
        queryFn: async () => {
            const response = await getPekerjaanById(selectedId!)
            return response.data as PekerjaanReviewDetail
        },
        enabled: selectedId !== null,
    })

    const progressQuery = useQuery({
        queryKey: ['puspen-pekerjaan-review-progress', selectedId],
        queryFn: () => getProgressReport(selectedId!),
        enabled: selectedId !== null,
    })

    const progressEstimasiQuery = useQuery({
        queryKey: ['puspen-pekerjaan-review-estimasi', selectedId, tahun],
        queryFn: () => getPekerjaanProgressEstimasi(selectedId!, tahun),
        enabled: selectedId !== null,
    })

    const detail = detailQuery.data
    const progressEstimasi = progressEstimasiQuery.data?.data ?? null
    const estimasiSummary = buildProgressEstimasiSummary(progressEstimasi)
    const stats = detail
        ? buildReviewStats(detail, {
            progressEstimasi,
            progressReport: progressQuery.data?.data,
        })
        : null
    const fotoMapPoints = buildFotoMapPoints(detail?.foto)
    const koordinatDesaSummary = buildKoordinatDesaSummary(detail?.foto)
    const fotoByLevel = buildFotoByLevel(detail?.foto)
    const fotoByKomponen = buildFotoByKomponen(detail?.foto, detail?.output)
    const progressItems = buildProgressItemChart(progressQuery.data?.data)
    const weeklyProgress = buildWeeklyProgressChart(progressQuery.data?.data)
    const outputRows = detail ? buildOutputRows(detail) : []
    const completeness = detail && stats
        ? buildCompletenessScore(detail, stats)
        : null
    const recommendations = detail && stats
        ? buildReviewRecommendations(detail, stats, fotoMapPoints)
        : []

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName={tool.toolName}
            accent={tool.accent}
            eyebrow={(
                <>
                    <FileSearch className="h-4 w-4" aria-hidden />
                    Analisa Paket
                </>
            )}
            title={tool.title}
            description={tool.description}
        >
            <div className="space-y-6">
                <section className={`bg-white p-4 sm:p-5 ${puspenBorder} ${puspenShadowLg}`}>
                    <div className={`mb-4 ${puspenLabel} text-[#111111]/60`}>Filter Paket Pekerjaan</div>
                    <div className="flex flex-wrap items-end gap-3">
                        <PuspenField label="Tahun Anggaran">
                            <PuspenInput
                                type="number"
                                value={tahun}
                                onChange={(event) => setTahun(Number(event.target.value) || tahun)}
                                className="w-28"
                                min={2020}
                                aria-label="Tahun anggaran"
                            />
                        </PuspenField>

                        <PuspenField label="Kecamatan" className="min-w-[200px] flex-1">
                            <PuspenSelect
                                value={kecamatanId}
                                onChange={(event) => setKecamatanId(event.target.value)}
                                aria-label="Filter kecamatan"
                            >
                                <option value={ALL_VALUE}>Semua kecamatan</option>
                                {(kecamatanQuery.data?.data ?? []).map((item) => (
                                    <option key={item.id} value={item.id.toString()}>{item.nama_kecamatan}</option>
                                ))}
                            </PuspenSelect>
                        </PuspenField>

                        <PuspenField label="Desa" className="min-w-[200px] flex-1">
                            <PuspenSelect
                                value={desaId}
                                onChange={(event) => setDesaId(event.target.value)}
                                disabled={kecamatanId === ALL_VALUE}
                                aria-label="Filter desa"
                            >
                                <option value={ALL_VALUE}>Semua desa</option>
                                {(desaQuery.data?.data ?? []).map((item) => (
                                    <option key={item.id} value={item.id.toString()}>{item.nama_desa}</option>
                                ))}
                            </PuspenSelect>
                        </PuspenField>

                        <PuspenField label="Pengawas" className="min-w-[200px] flex-1">
                            <PuspenSelect
                                value={pengawasId}
                                onChange={(event) => setPengawasId(event.target.value)}
                                aria-label="Filter pengawas"
                            >
                                <option value={ALL_VALUE}>Semua pengawas</option>
                                {(pengawasQuery.data?.data ?? []).map((item) => (
                                    <option key={item.id} value={item.id.toString()}>{item.nama}</option>
                                ))}
                            </PuspenSelect>
                        </PuspenField>

                        <PuspenField label="Pendamping" className="min-w-[200px] flex-1">
                            <PuspenSelect
                                value={pendampingId}
                                onChange={(event) => setPendampingId(event.target.value)}
                                aria-label="Filter pendamping"
                            >
                                <option value={ALL_VALUE}>Semua pendamping</option>
                                {(pengawasQuery.data?.data ?? []).map((item) => (
                                    <option key={item.id} value={item.id.toString()}>{item.nama}</option>
                                ))}
                            </PuspenSelect>
                        </PuspenField>

                        <PuspenButton
                            variant="ghost"
                            onClick={() => listQuery.refetch()}
                            disabled={listQuery.isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${listQuery.isFetching ? 'animate-spin' : ''}`} />
                            Muat Ulang
                        </PuspenButton>

                        <PuspenButton variant="secondary" onClick={resetFilters}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </PuspenButton>
                    </div>
                </section>

                <ReviewPaketPicker
                    items={listQuery.data?.data ?? []}
                    total={listQuery.data?.meta?.total ?? 0}
                    loading={listQuery.isLoading}
                    search={search}
                    onSearchChange={setSearch}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />

                {!selectedId ? (
                    <div className={`bg-[#FFF7E8] p-8 text-center ${puspenBorder} ${puspenShadowMd}`}>
                        <FileSearch className="mx-auto mb-3 h-10 w-10 text-[#111111]/40" />
                        <p className="font-bold text-[#111111]/70">
                            Pilih paket pekerjaan untuk menampilkan analisa foto, penerima, progress, dan statistik.
                        </p>
                    </div>
                ) : detailQuery.isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm font-bold text-[#111111]/70">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Memuat analisa pekerjaan...
                    </div>
                ) : detail && stats ? (
                    <div className="space-y-6">
                        <section className={`bg-white p-5 ${puspenBorder} ${puspenShadowLg}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-[0.08em] text-[#111111]">
                                        {detail.nama_paket}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-[#111111]/75">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {detail.desa?.nama_desa}, {detail.kecamatan?.nama_kecamatan}
                                        </span>
                                        {detail.kode_rekening ? (
                                            <PuspenBadge>Rek. {detail.kode_rekening}</PuspenBadge>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex flex-col items-stretch gap-3 sm:items-end">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <ReviewStaffInfo role="Pengawas" person={detail.pengawas} />
                                        <ReviewStaffInfo role="Pendamping" person={detail.pendamping} />
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Link to="/pekerjaan/$id" params={{ id: String(detail.id) }} className={linkButtonClass}>
                                            <ExternalLink className="h-4 w-4" />
                                            Detail
                                        </Link>
                                        <Link
                                            to="/map"
                                            search={{ search: detail.nama_paket, tahun: String(tahun) }}
                                            className={linkButtonClass}
                                        >
                                            <MapIcon className="h-4 w-4" />
                                            Peta Global
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="text-sm">
                                    <span className="font-bold text-[#111111]/55">Kegiatan:</span>{' '}
                                    {detail.kegiatan?.nama_kegiatan ?? '-'}
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold text-[#111111]/55">Penyedia:</span>{' '}
                                    {detail.kontrak?.[0]?.penyedia?.nama ?? '-'}
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold text-[#111111]/55">SPK:</span>{' '}
                                    {detail.kontrak?.[0]?.spk ?? '-'}
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold text-[#111111]/55">Tag:</span>{' '}
                                    {detail.tags?.map((tag) => tag.name).join(', ') || '-'}
                                </div>
                            </div>
                        </section>

                        {completeness ? (
                            <ReviewInsightsPanel
                                pekerjaanId={detail.id}
                                pekerjaanName={detail.nama_paket}
                                completeness={completeness}
                                recommendations={recommendations}
                            />
                        ) : null}

                        <ReviewProgressEstimasiPanel
                            tahun={tahun}
                            estimasi={estimasiSummary}
                            progressItemWeighted={stats.progressItemWeighted}
                            puspenSnapshots={progressEstimasiQuery.data?.puspen_progress_fisik}
                        />

                        <section className={`bg-white p-4 ${puspenBorder} ${puspenShadowLg}`}>
                            <SectionHeading icon={MapIcon} title="Peta Sebaran Foto" />
                            <ReviewFotoMap
                                points={fotoMapPoints}
                                totalFotos={stats.fotoCount}
                                pekerjaanName={detail.nama_paket}
                                desaName={detail.desa?.nama_desa}
                                kecamatanName={detail.kecamatan?.nama_kecamatan}
                                koordinatSummary={koordinatDesaSummary}
                                outputs={detail.output}
                            />
                        </section>

                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Estimasi Fisik"
                                value={formatPercent(stats.estimasiFisik ?? stats.progressFisik)}
                                hint={stats.estimasiFisikRencana !== null
                                    ? `Rencana ${formatPercent(stats.estimasiFisikRencana)}`
                                    : 'Tab Progress'}
                                accent="bg-[#2ECC71]/20"
                            />
                            <StatCard
                                label="Deviasi Estimasi"
                                value={formatPercent(stats.estimasiFisikDeviasi ?? stats.deviasi)}
                                hint={stats.progressItemWeighted !== null
                                    ? `Item mingguan ${formatPercent(stats.progressItemWeighted)}`
                                    : undefined}
                                accent="bg-[#FFB703]/25"
                            />
                            <StatCard
                                label="Estimasi Keuangan"
                                value={formatPercent(stats.estimasiKeuangan)}
                                hint={stats.estimasiKeuanganRencana !== null
                                    ? `Rencana ${formatPercent(stats.estimasiKeuanganRencana)}`
                                    : 'Tab Progress'}
                                accent="bg-[#8ECAE6]/40"
                            />
                            <StatCard
                                label="Penerima"
                                value={String(stats.penerimaCount)}
                                hint={`${stats.totalJiwa} jiwa`}
                                accent="bg-[#8ECAE6]/40"
                            />
                            <StatCard
                                label="Foto Dokumentasi"
                                value={stats.fotoRequired
                                    ? `${stats.fotoCount}/${stats.fotoRequired}`
                                    : String(stats.fotoCount)}
                                hint={formatFotoStatus(stats.fotoStatus)}
                                accent="bg-[#E63946]/15"
                            />
                            <StatCard label="Komponen Output" value={String(stats.outputCount)} accent="bg-[#FFF7E8]" />
                            <StatCard label="Pagu" value={formatCurrency(stats.pagu)} accent="bg-[#FFF7E8]" />
                            <StatCard
                                label="Nilai Kontrak"
                                value={stats.nilaiKontrak ? formatCurrency(stats.nilaiKontrak) : '-'}
                                accent="bg-[#FFF7E8]"
                            />
                            <StatCard label="Berkas" value={String(detail.berkas?.length ?? 0)} accent="bg-[#FFF7E8]" />
                        </section>

                        <section className="grid gap-4 xl:grid-cols-2">
                            <ChartPanel title="Foto per Progress" subtitle="Distribusi slot 0% – 100%">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={fotoByLevel}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="level" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#E63946" name="Jumlah foto" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartPanel>

                            <ChartPanel title="Foto per Komponen" subtitle="Volume dokumentasi tiap output">
                                {fotoByKomponen.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={fotoByKomponen} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" allowDecimals={false} />
                                            <YAxis type="category" dataKey="komponen" width={120} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#FB8500" name="Jumlah foto" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="Belum ada foto per komponen." />
                                )}
                            </ChartPanel>

                            <ChartPanel title="Progress per Item" subtitle="Persentase realisasi tiap item pekerjaan">
                                {progressItems.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={progressItems} layout="vertical" margin={{ left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis type="category" dataKey="name" width={130} />
                                            <Tooltip />
                                            <Bar dataKey="progress" fill="#2ECC71" name="Progress (%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="Belum ada data progress item." />
                                )}
                            </ChartPanel>

                            <ChartPanel title="Kurva Mingguan" subtitle="Akumulasi rencana vs realisasi per minggu">
                                {weeklyProgress.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={weeklyProgress}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="minggu" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="rencana" stroke="#FFB703" name="Rencana" />
                                            <Line type="monotone" dataKey="realisasi" stroke="#2ECC71" name="Realisasi" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart message="Belum ada kurva mingguan." />
                                )}
                            </ChartPanel>
                        </section>

                        <section>
                            <SectionHeading icon={BarChart3} title="Komponen Output" />
                            <PuspenDataTable
                                columns={[
                                    { key: 'komponen', header: 'Komponen', cell: (row) => <span className="font-black">{row.komponen}</span> },
                                    { key: 'volume', header: 'Volume', cell: (row) => `${row.volume} ${row.satuan}` },
                                    { key: 'tipe', header: 'Tipe', cell: (row) => row.tipe },
                                    { key: 'foto', header: 'Foto', cell: (row) => row.fotoCount, className: 'text-center' },
                                    { key: 'target', header: 'Target Foto', cell: (row) => row.requiredFoto, className: 'text-center' },
                                ]}
                                rows={outputRows}
                                getRowKey={(row) => row.id}
                                emptyMessage="Belum ada komponen output."
                            />
                        </section>

                        <section>
                            <SectionHeading icon={Users} title="Daftar Penerima" />
                            <PuspenDataTable
                                columns={[
                                    { key: 'nama', header: 'Nama', cell: (row) => <span className="font-black">{row.nama}</span> },
                                    { key: 'nik', header: 'NIK', cell: (row) => <span className="font-mono text-xs">{row.nik || '-'}</span> },
                                    { key: 'alamat', header: 'Alamat', cell: (row) => row.alamat || '-' },
                                    { key: 'jiwa', header: 'Jiwa', cell: (row) => row.jumlah_jiwa, className: 'text-center' },
                                ]}
                                rows={(detail.penerima ?? []).slice(0, 25)}
                                getRowKey={(row) => row.id}
                                emptyMessage="Belum ada penerima."
                            />
                            {(detail.penerima?.length ?? 0) > 25 ? (
                                <p className="mt-2 text-xs font-bold text-[#111111]/60">
                                    Menampilkan 25 dari {detail.penerima?.length} penerima.
                                </p>
                            ) : null}
                        </section>

                        <section className={`bg-white p-4 ${puspenBorder} ${puspenShadowLg}`}>
                            <SectionHeading icon={Camera} title="Galeri Foto Terbaru" />
                            <ReviewFotoGallery fotos={detail.foto} outputs={detail.output} />
                        </section>
                    </div>
                ) : (
                    <div className={`bg-[#FDE2E4] p-6 text-center ${puspenBorder}`}>
                        <p className="font-bold text-[#111111]">Gagal memuat data pekerjaan.</p>
                    </div>
                )}
            </div>
        </PuspenToolLayout>
    )
}

function SectionHeading({
    icon: Icon,
    title,
}: {
    icon: ComponentType<{ className?: string }>
    title: string
}) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#111111]" />
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">{title}</h3>
        </div>
    )
}

function ChartPanel({
    title,
    subtitle,
    children,
}: {
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div className={`bg-white p-4 ${puspenBorder} ${puspenShadowLg}`}>
            <div className="mb-3">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">{title}</h3>
                <p className="text-xs font-bold text-[#111111]/60">{subtitle}</p>
            </div>
            {children}
        </div>
    )
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className={`flex h-[260px] items-center justify-center border border-dashed border-[#111111]/30 bg-[#FFF7E8]/50 text-sm font-black uppercase tracking-widest text-[#111111]/55`}>
            {message}
        </div>
    )
}