import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { lazyImport } from '@/lib/utils'
import {
    getPublicSanitasiMapStats,
    getPublicSanitasiStats,
    getPublicSpamMapStats,
    getPublicSpamUnitStats,
    type LandingSpmSector,
} from '../../api/spam-stats'
import { getPublicMessages } from '../../i18n/messages'
import { usePublicLocale } from '../../i18n/use-public-locale'
import {
    buildAirMinumDesaRows,
    buildSanitasiDesaRows,
    getUniqueKecamatans,
    type SpmCoverageTierFilter,
} from '../../lib/spm-desa-table'
import { buildPublicAirMinumMetrics, buildPublicSanitasiMetrics } from '../../lib/spm-public-stats'
import { parseSpmSector } from '../../lib/spm-sector'
import { buildSpmTahunQueryParam } from '../../lib/spm-year'
import { filterPublicSpmMapStats } from '../../lib/spm-reserved-wilayah'
import { LandingSpmMap } from '../landing-spm-map'
import { SpmSectorTabs } from '../spm-sector-tabs'
import { PublicPageHeader } from './PublicPageHeader'
import { SpmAggregateCards } from './SpmAggregateCards'
import { SpmDesaTable } from './SpmDesaTable'
import { SpmDesaDetailCard } from './SpmDesaDetailCard'
import { SpmInfrastructureBreakdown } from './SpmInfrastructureBreakdown'
import { SpmYearlyTrendChart } from './SpmYearlyTrendChart'
import { SpmSectionNav } from './SpmSectionNav'
import { LocaleToggle } from '../locale-toggle'
import { trackVisitorEvent } from '@/lib/analytics/visitor-events'
import { SpmSyncDisclaimer } from '../spm-sync-disclaimer'

const Grainient = lazy(() => lazyImport(() => import('@/components/ui/Grainient'), 'grainient'))

type SpmDetailPageProps = {
    sector?: LandingSpmSector
    tahun?: string
}

type SpmSection = 'map' | 'summary' | 'table'

export function SpmDetailPage({ sector: sectorProp, tahun }: SpmDetailPageProps) {
    const navigate = useNavigate({ from: '/capaian-spm' })
    const { messages } = usePublicLocale()
    const sector = parseSpmSector(sectorProp)
    const copy = messages.spmDetail ?? getPublicMessages('id').spmDetail
    const sectorCopy =
        messages.landing.spm.sectors[sector] ?? messages.landing.spm.sectors.air_minum
    const tahunParams = buildSpmTahunQueryParam(tahun)

    const [selectedDesaId, setSelectedDesaId] = useState<number | null>(null)
    const [kecamatanFilter, setKecamatanFilter] = useState('')
    const [coverageTierFilter, setCoverageTierFilter] = useState<SpmCoverageTierFilter>('all')
    const [activeSection, setActiveSection] = useState<SpmSection>('map')
    const mapSectionRef = useRef<HTMLElement>(null)
    const summarySectionRef = useRef<HTMLElement>(null)
    const tableSectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        void trackVisitorEvent('spm_detail_view', {
            sector,
            tahun: tahun ?? 'latest',
        })
    }, [sector, tahun])

    useEffect(() => {
        setSelectedDesaId(null)
        setKecamatanFilter('')
        setCoverageTierFilter('all')
    }, [sector, tahun])

    const setSector = (nextSector: LandingSpmSector) => {
        navigate({
            search: (prev) => ({ ...prev, sector: nextSector }),
        })
    }

    const setTahun = (nextTahun: string) => {
        navigate({
            search: (prev) => ({
                ...prev,
                tahun: nextTahun || undefined,
            }),
        })
    }

    const handleDesaSelect = useCallback((desaId: number | null) => {
        setSelectedDesaId(desaId)
        if (desaId) {
            void trackVisitorEvent('spm_detail_desa_select', { sector, desa_id: desaId })
        }
    }, [sector])

    const scrollToSection = useCallback((section: SpmSection) => {
        setActiveSection(section)
        const target =
            section === 'map'
                ? mapSectionRef.current
                : section === 'summary'
                  ? summarySectionRef.current
                  : tableSectionRef.current
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [])

    const { data: airMapResponse, isLoading: isAirMapLoading } = useQuery({
        queryKey: ['spm-detail-air-map', tahun ?? 'all'],
        queryFn: () => getPublicSpamMapStats(tahunParams),
        staleTime: 30_000,
    })

    const { data: airUnitResponse } = useQuery({
        queryKey: ['spm-detail-air-unit', tahun ?? 'all'],
        queryFn: () => getPublicSpamUnitStats(tahunParams),
        staleTime: 30_000,
    })

    const { data: sanitasiMapResponse, isLoading: isSanitasiMapLoading } = useQuery({
        queryKey: ['spm-detail-sanitasi-map', tahun ?? 'all'],
        queryFn: () => getPublicSanitasiMapStats(tahunParams),
        staleTime: 30_000,
    })

    const { data: sanitasiStatsResponse } = useQuery({
        queryKey: ['spm-detail-sanitasi-stats', tahun ?? 'all'],
        queryFn: () => getPublicSanitasiStats(tahunParams),
        staleTime: 30_000,
    })

    const tableRows = useMemo(() => {
        if (sector === 'sanitasi') {
            return buildSanitasiDesaRows(sanitasiMapResponse?.data ?? [])
        }

        return buildAirMinumDesaRows(airMapResponse?.data ?? [])
    }, [sector, airMapResponse?.data, sanitasiMapResponse?.data])

    const kecamatanOptions = useMemo(() => getUniqueKecamatans(tableRows), [tableRows])

    const selectedRow = useMemo(
        () => tableRows.find((row) => row.desa_id === selectedDesaId) ?? null,
        [tableRows, selectedDesaId],
    )

    const aggregateMeta = useMemo(() => {
        if (sector === 'sanitasi') {
            const rows = filterPublicSpmMapStats(sanitasiMapResponse?.data ?? [])
            const sanitasiStats = sanitasiStatsResponse?.data

            const sanitasiMetrics = buildPublicSanitasiMetrics(
                sanitasiStats,
                messages.landing.spm.sanitasiYearFilter.all,
            )

            return {
                unitStats: undefined,
                airMetrics: undefined,
                sanitasiStats,
                desaTotal: sanitasiStats?.total_desa ?? rows.length,
                desaWithCapaian:
                    sanitasiStats?.desa_with_infrastruktur ??
                    rows.filter((row) => row.pemanfaat_kk > 0).length,
                kecamatan: sanitasiStats?.wilayah_total_kecamatan ?? 0,
                scopeLabel: sanitasiMetrics?.scopeLabel ?? copy.aggregate.sanitasi.scopeLabel,
            }
        }

        const rows = filterPublicSpmMapStats(airMapResponse?.data ?? [])
        const unitStats = airUnitResponse?.data
        const airMetrics = buildPublicAirMinumMetrics(unitStats)

        return {
            unitStats,
            airMetrics,
            sanitasiStats: undefined,
            desaTotal: unitStats?.wilayah_total_desa ?? rows.length,
            desaWithCapaian: rows.filter((row) => row.kk > 0).length,
            kecamatan: unitStats?.wilayah_total_kecamatan ?? 0,
            scopeLabel: airMetrics?.scopeLabel ?? copy.aggregate.airMinum.scopeFallback,
        }
    }, [
        sector,
        airMapResponse?.data,
        airUnitResponse?.data,
        sanitasiMapResponse?.data,
        sanitasiStatsResponse?.data,
        copy.aggregate.airMinum.scopeFallback,
        copy.aggregate.sanitasi.scopeLabel,
        messages.landing.spm.sanitasiYearFilter.all,
    ])

    const isTableLoading = sector === 'sanitasi' ? isSanitasiMapLoading : isAirMapLoading

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,159,252,0.9),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(82,39,255,0.95),transparent_42%),linear-gradient(135deg,#b497cf_0%,#8f78ff_48%,#5227ff_100%)] text-white antialiased">
            <Suspense fallback={null}>
                <Grainient
                    className="fixed inset-0 z-0 opacity-90 pointer-events-none overflow-hidden"
                    color1="#FF9FFC"
                    color2="#5227FF"
                    color3="#B497CF"
                    timeSpeed={0.15}
                    warpStrength={0.8}
                />
            </Suspense>

            <PublicPageHeader copy={copy.header} />

            <SpmSectionNav
                copy={copy.nav}
                activeSection={activeSection}
                onNavigate={scrollToSection}
            />

            <main className="relative z-10 pt-28 pb-16 lg:pt-36 lg:pb-24">
                <section className="container mx-auto px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                            {copy.hero.eyebrow}
                        </p>
                        <h1 className="mb-4 text-4xl font-medium tracking-tight lg:text-5xl">
                            {sectorCopy.title}
                        </h1>
                        <p className="text-sm leading-relaxed text-white/75 lg:text-base">
                            {copy.hero.description}
                        </p>
                        <SpmSyncDisclaimer
                            text={copy.syncDisclaimer ?? messages.landing.spm.syncDisclaimer}
                            className="mx-auto mt-6 max-w-3xl"
                        />
                    </div>
                </section>

                <section ref={mapSectionRef} className="container mx-auto mt-10 px-6 scroll-mt-32">
                    <div className="mb-6 flex justify-center">
                        <SpmSectorTabs
                            sector={sector}
                            onSectorChange={setSector}
                            airMinumLabel={messages.landing.spm.sectors.air_minum.filterLabel}
                            sanitasiLabel={messages.landing.spm.sectors.sanitasi.filterLabel}
                            ariaLabel={messages.landing.spm.filterAria}
                        />
                    </div>
                    <LandingSpmMap
                        sector={sector}
                        tahun={tahun}
                        onTahunChange={setTahun}
                        selectedDesaId={selectedDesaId}
                        onDesaSelect={handleDesaSelect}
                    />
                    <SpmDesaDetailCard
                        row={selectedRow}
                        sector={sector}
                        copy={copy.detailCard}
                        mapCopy={messages.landing.spm.map}
                        onClose={() => setSelectedDesaId(null)}
                    />
                </section>

                <section
                    ref={summarySectionRef}
                    className="container mx-auto mt-10 space-y-6 px-6 scroll-mt-32"
                >
                    <SpmAggregateCards
                        sector={sector}
                        unitStats={aggregateMeta.unitStats}
                        airMetrics={aggregateMeta.airMetrics}
                        sanitasiStats={aggregateMeta.sanitasiStats}
                        desaTotal={aggregateMeta.desaTotal}
                        desaWithCapaian={aggregateMeta.desaWithCapaian}
                        kecamatan={aggregateMeta.kecamatan}
                        scopeLabel={aggregateMeta.scopeLabel}
                        copy={copy.aggregate}
                    />

                    <SpmYearlyTrendChart
                        sector={sector}
                        highlightTahun={tahun}
                        copy={copy.yearlyChart}
                    />

                    {sector === 'sanitasi' && aggregateMeta.sanitasiStats ? (
                        <SpmInfrastructureBreakdown
                            stats={aggregateMeta.sanitasiStats}
                            copy={copy.infrastructure}
                        />
                    ) : null}
                </section>

                <section ref={tableSectionRef} className="container mx-auto mt-10 px-6 scroll-mt-32">
                    <SpmDesaTable
                        key={`${sector}-${tahun ?? 'all'}`}
                        sector={sector}
                        rows={tableRows}
                        copy={copy.table}
                        filterCopy={copy.filters}
                        isLoading={isTableLoading}
                        kecamatanFilter={kecamatanFilter}
                        onKecamatanFilterChange={setKecamatanFilter}
                        coverageTierFilter={coverageTierFilter}
                        onCoverageTierFilterChange={setCoverageTierFilter}
                        kecamatanOptions={kecamatanOptions}
                    />
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/10 py-8">
                <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        {messages.landing.footer.copyright}
                    </p>
                    <LocaleToggle variant="footer" />
                </div>
            </footer>
        </div>
    )
}